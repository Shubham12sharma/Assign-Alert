# Django & DRF imports
from django.db import models
from django.utils import timezone
from django.contrib.auth import authenticate

from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

# JWT imports
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Local app imports
from .models import User, Community, Task, Epic, Sprint, Alert
from .serializers import (
    UserSerializer, CommunitySerializer, TaskSerializer,
    EpicSerializer, SprintSerializer, AlertSerializer
)
from .permissions import IsSuperAdmin


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Login with either 'username' or 'email' + 'password'
    """

    def validate(self, attrs):
        # Debug: see exactly what arrived
        print("Received login payload:", attrs)

        username = attrs.get('username')
        email = attrs.get('email')
        password = attrs.get('password')

        if not password:
            raise serializers.ValidationError(
                {'password': 'This field is required.'}
            )

        # Use whichever was provided
        login_identifier = username if username else email

        if not login_identifier:
            raise serializers.ValidationError(
                {'detail': 'Must provide either "username" or "email".'}
            )

        # Try authentication
        user = authenticate(
            request=self.context.get('request'),
            username=login_identifier,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                {'detail': 'Invalid credentials.'},
                code='authorization'
            )

        # Tell JWT who is logging in
        self.user = user

        # Make sure we pass correct username to parent (JWT requires it)
        attrs['username'] = user.username

        # Generate tokens
        data = super().validate(attrs)

        # Add user data to response
        data['user'] = UserSerializer(user).data

        print("Login successful, returning:", data)
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
# ———————————————————————— Rest of your ViewSets (cleaned & fixed) ————————————————————————

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if getattr(self.request.user, 'role', None) == 'Super Admin':
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)


class CommunityViewSet(viewsets.ModelViewSet):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    lookup_field = 'mongo_id'
    lookup_url_kwarg = 'mongo_id'

    def get_permissions(self):
        """
        - Anyone authenticated can list, retrieve, join, leave
        - Only Super Admin can create, update, partial_update, destroy
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSuperAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user_id = str(self.request.user.pk)
        if self.request.user.role == 'Super Admin':
            return Community.objects.all()
        return Community.objects.filter(members__contains=[user_id])

    @action(detail=True, methods=['post'])
    def join(self, request, mongo_id=None):
        community = self.get_object()
        user_id = str(request.user.pk)
        if user_id not in community.members:
            community.members.append(user_id)
            community.member_count += 1
            community.save()
        return Response({'status': 'joined'})

    @action(detail=True, methods=['post'])
    def leave(self, request, mongo_id=None):
        community = self.get_object()
        user_id = str(request.user.pk)
        if user_id in community.members:
            community.members.remove(user_id)
            community.member_count = max(0, community.member_count - 1)
            community.save()
            return Response({"status": "left", "message": "Successfully left the community"})
        return Response({"error": "You are not a member of this community"}, status=400)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    # These lines prevent integer conversion crash
    lookup_field = 'pk'                # Keep as 'pk' (MongoDB uses _id internally)
    lookup_url_kwarg = 'pk'

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) in ['Super Admin', 'Admin']:
            return Task.objects.all()

        user_pk = str(user.pk)
        return Task.objects.filter(
            models.Q(community__members__contains=[user_pk]) |
            models.Q(is_personal=True, assignee=user_pk)
        )

    def perform_create(self, serializer):
        serializer.save(assignee=str(self.request.user.pk))

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        task = self.get_object()
        text = request.data.get('text')
        if not text:
            return Response({'error': 'text is required'}, status=400)

        comment = {
            'text': text,
            'user': str(request.user.pk),
            'timestamp': timezone.now().isoformat()
        }
        task.comments.append(comment)
        task.save()
        return Response({'status': 'comment added'})

class EpicViewSet(viewsets.ModelViewSet):
    queryset = Epic.objects.all()
    serializer_class = EpicSerializer
    permission_classes = [permissions.IsAuthenticated]


class SprintViewSet(viewsets.ModelViewSet):
    queryset = Sprint.objects.all()
    serializer_class = SprintSerializer
    permission_classes = [permissions.IsAuthenticated]


class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Alert.objects.filter(user=str(self.request.user.pk))


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)