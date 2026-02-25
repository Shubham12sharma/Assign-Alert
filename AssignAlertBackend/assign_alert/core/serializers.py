from rest_framework import serializers
from .models import User, Community, Task, Epic, Sprint, Alert,Comment
import bson
import uuid
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import  CommunityInvite



User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    id = serializers.CharField(source='pk', read_only=True)
    name = serializers.SerializerMethodField(read_only=True)

    # Signup-only helper fields (not saved to model)
    choice = serializers.ChoiceField(
        choices=['create', 'join'],
        write_only=True,
        required=False
    )
    community_name = serializers.CharField(write_only=True, required=False)
    community_id = serializers.CharField(write_only=True, required=False)
    invite = serializers.CharField(write_only=True, required=False)  # ← for invite code

    communities = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'name', 'password', 'role',
            'communities', 'main_community',
            'choice', 'community_name', 'community_id', 'invite',
        ]
        # Role is controlled with validation & view-level checks, not globally read-only
        read_only_fields = []

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def validate_role(self, value):
        """
        Restrict role values to the two allowed roles.
        This is only relevant on updates – on signup we always default to 'Member'
        or upgrade the creator to 'Super Admin' in create().
        """
        if value and value not in ['Member', 'Super Admin']:
            raise serializers.ValidationError("Only 'Super Admin' or 'Member' are valid roles.")
        return value

    def validate(self, data):
        choice = data.get('choice')
        if choice == 'create' and not data.get('community_name'):
            raise serializers.ValidationError({"community_name": "Required when choice='create'"})
        if choice == 'join' and not data.get('community_id') and not data.get('invite'):
            raise serializers.ValidationError({"community_id or invite": "Required when choice='join'"})
        return data

    @transaction.atomic
    def create(self, validated_data):
        # Pop helper fields
        password = validated_data.pop('password')
        choice = validated_data.pop('choice', None)
        community_name = validated_data.pop('community_name', None)
        community_id = validated_data.pop('community_id', None)
        invite_code = validated_data.pop('invite', None)

        # Prevent client from setting dangerous roles
        validated_data['role'] = 'Member'  # default safe value

        # Create user
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # ── CREATE flow ───────────────────────────────────────
        if choice == 'create' and community_name:
            community = Community.objects.create(
                name=community_name,
                parent=None
            )
            community.members.add(user)
            # Creator should be super admin of the newly created community
            user.role = 'Super Admin'
            user.main_community = str(community.id)
            user.save(update_fields=['main_community', 'role'])

        # ── JOIN flow (via direct ID or invite code) ──────────
        elif choice == 'join':
            community = None

            # Prefer invite code if provided
            if invite_code:
                try:
                    invite = CommunityInvite.objects.get(
                        code=invite_code,
                        is_used=False
                    )
                    community = invite.community
                    # Optional: set role from invite
                    if invite.role:
                        user.role = invite.role
                    invite.is_used = True
                    invite.used_by = user
                    invite.save()
                except CommunityInvite.DoesNotExist:
                    raise serializers.ValidationError({"invite": "Invalid or already used invite code"})

            # Fallback to direct community_id
            elif community_id:
                try:
                    community = Community.objects.get(id=community_id)
                except Community.DoesNotExist:
                    raise serializers.ValidationError({"community_id": "Invalid community ID"})

            if community:
                community.members.add(user)
                user.main_community = str(community.id)
                user.save(update_fields=['main_community', 'role'])

        return user

    def update(self, instance, validated_data):
        """
        Prevent client from attempting to modify immutable primary key fields.
        MongoDB will raise if an update tries to change '_id'. Strip any id-like
        keys that may be included by the frontend before delegating to the
        default update implementation.
        """
        # Remove common id fields that should never be set by the client
        for forbidden in ['id', 'pk', '_id', 'mongo_id', 'user_id']:
            if forbidden in validated_data:
                validated_data.pop(forbidden, None)

        # Also remove nested 'pk' if frontend included a nested source mapping
        # e.g. {'pk': '...'}
        validated_data.pop('pk', None)

        return super().update(instance, validated_data)

class CommunitySerializer(serializers.ModelSerializer):
    mongo_id = serializers.CharField(source='pk', read_only=True)

    class Meta:
        model = Community
        fields = ['mongo_id', 'name', 'parent', 'member_count']

   


class TaskSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True, source='pk')

    description = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)

    priority = serializers.ChoiceField(
        choices=Task.PRIORITY_CHOICES,
        required=False,
        default='Medium'
    )

    task_level = serializers.ChoiceField(
        choices=Task.LEVEL_CHOICES,
        required=False,
        default='Easy'
    )

    status = serializers.ChoiceField(
        choices=Task.STATUS_CHOICES,
        required=False,
        default='To Do'
    )

    assignee = serializers.CharField(required=False, allow_null=True)
    community = serializers.PrimaryKeyRelatedField(
            queryset=Community.objects.all(),
            required=False,
            allow_null=True,
            write_only=False,   # can be read + write
        )

    class Meta:
        model = Task
        fields = "__all__"
    
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Convert ObjectId → str for any remaining fields
        for key in ['id', 'community', 'sprint', 'epic', 'assignee']:
            if key in ret and ret[key] is not None:
                ret[key] = str(ret[key])
        return ret


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'timestamp']
class MinimalUserSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)   

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Extra safety (though not needed after above change)
        if 'id' in ret:
            ret['id'] = str(ret['id'])
        return ret


class EpicSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True, source='pk')

    class Meta:
        model = Epic
        fields = '__all__'

    def to_representation(self, instance):
        """
        Normalize field names for frontend:
        - start_date  -> startDate
        - end_date    -> targetDate
        - community   -> communityId
        - add sprintCount / completedSprints derived from Sprint model
        """
        from .models import Sprint  # local import to avoid circular

        ret = super().to_representation(instance)

        # Basic ID-style conversions
        if ret.get('id'):
            ret['id'] = str(ret['id'])
        if ret.get('community'):
            ret['communityId'] = str(ret['community'])

        # Date normalization
        if instance.start_date:
            ret['startDate'] = instance.start_date.date().isoformat()
        if instance.end_date:
            ret['targetDate'] = instance.end_date.date().isoformat()

        # Derived sprint metrics
        epic_id_str = str(instance.pk)
        epic_sprints = Sprint.objects.filter(epic=epic_id_str)
        sprint_count = epic_sprints.count()
        completed_count = epic_sprints.filter(status='completed').count()

        ret['sprintCount'] = sprint_count
        ret['completedSprints'] = completed_count

        # Simple list of sprint IDs linked to this epic
        ret['sprintIds'] = [str(s.id) for s in epic_sprints]

        return ret


class SprintSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True, source='pk')

    class Meta:
        model = Sprint
        fields = '__all__'

    def to_representation(self, instance):
        """
        Normalize for frontend:
        - start_date/end_date -> startDate/endDate
        - epic/community -> epicId/communityId
        """
        ret = super().to_representation(instance)

        if ret.get('id'):
            ret['id'] = str(ret['id'])

        if instance.start_date:
            ret['startDate'] = instance.start_date.isoformat()
        if instance.end_date:
            ret['endDate'] = instance.end_date.isoformat()

        if instance.epic:
            ret['epicId'] = str(instance.epic)
        if instance.community:
            ret['communityId'] = str(instance.community)

        return ret


class AlertSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True, source='pk')

    class Meta:
        model = Alert
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)

        for field in ['id', 'user', 'task', 'sprint']:
            if field in ret and ret[field]:
                ret[field] = str(ret[field])

        return ret
