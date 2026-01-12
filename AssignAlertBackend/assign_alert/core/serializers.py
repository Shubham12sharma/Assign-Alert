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
    mongo_id = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = "__all__"

    def get_mongo_id(self, obj):
        return str(obj.id)   



class TaskSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Task
        fields = '__all__'


class EpicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Epic
        fields = '__all__'

class SprintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sprint
        fields = '__all__'

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = '__all__'
