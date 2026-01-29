from rest_framework import serializers
from .models import User, Community, Task, Epic, Sprint, Alert
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
        read_only_fields = ['role']  # ← important: prevent client from setting role

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def validate_role(self, value):
        # Optional: if you allow role in payload, restrict it
        if value and value not in ['Member', 'Guest']:
            raise serializers.ValidationError("Only 'Member' or 'Guest' allowed on signup.")
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
            user.main_community = str(community.id)
            user.save(update_fields=['main_community'])

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

class CommunitySerializer(serializers.ModelSerializer):
    mongo_id = serializers.CharField(source='pk', read_only=True)

    class Meta:
        model = Community
        fields = ['mongo_id', 'name', 'parent', 'member_count']

   


class TaskSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True, source='pk')  # Force ID as string

    class Meta:
        model = Task
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Safety: convert any ObjectId fields to string
        for field in ['id', 'assignee', 'community']:
            if field in ret and ret[field]:
                ret[field] = str(ret[field])
        return ret

class EpicSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True, source='pk')

    class Meta:
        model = Epic
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)

        # Convert possible ObjectId fields to string
        for field in ['id', 'community']:
            if field in ret and ret[field]:
                ret[field] = str(ret[field])

        return ret


class SprintSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True, source='pk')

    class Meta:
        model = Sprint
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)

        for field in ['id', 'epic', 'community']:
            if field in ret and ret[field]:
                ret[field] = str(ret[field])

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
