from rest_framework import serializers
from .models import User, Community, Task, Epic, Sprint, Alert
import bson




class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    id = serializers.CharField(source='pk', read_only=True)
    name = serializers.SerializerMethodField(read_only=True)

    communities = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'password', 'role', 'communities']

    def validate(self, data):
        # Add this for better debugging
        print("Validation data:", data)  # ← check terminal
        return data

    def create(self, validated_data):
        print("Creating user with:", validated_data)  # ← add this
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        try:
            user.save()
        except Exception as e:
            print("Save error:", str(e))  # ← see real database error
            raise
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

    def get_name(self, instance):
        full = f"{instance.first_name} {instance.last_name}".strip()
        return full if full else instance.username




class CommunitySerializer(serializers.ModelSerializer):
    mongo_id = serializers.CharField(required=True)  # ← Allow writing (required for POST)

    class Meta:
        model = Community
        fields = ['mongo_id', 'name', 'parent', 'members', 'member_count']
        extra_kwargs = {
            'mongo_id': {'write_only': False, 'read_only': False},  # Explicitly allow read & write
        }

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Safety: ensure mongo_id is always string in response
        if 'mongo_id' in ret and ret['mongo_id']:
            ret['mongo_id'] = str(ret['mongo_id'])
        return ret


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

