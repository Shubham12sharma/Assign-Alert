# Django core
from django.db import models, transaction
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model

# DRF & JWT
from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Your local imports
from .models import User, Community, Task, Epic, Sprint, Alert, CommunityInvite
from .serializers import (
    UserSerializer, CommunitySerializer, TaskSerializer,
    EpicSerializer, SprintSerializer, AlertSerializer
)


# ───────────────────────────────────────────────
# Custom Permission Classes (recommended)
# ───────────────────────────────────────────────

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'Super Admin'


class IsCommunityAdminOrSuperAdmin(permissions.BasePermission):
    """Allows Super Admin always + Admin only if member of this community"""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'Super Admin':
            return True
        return (
            request.user.role == 'Admin' and
            obj.members.filter(pk=request.user.pk).exists()
        )


# ───────────────────────────────────────────────
# JWT Login
# ───────────────────────────────────────────────

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        print("Received login payload:", attrs)

        username = attrs.get('username')
        email = attrs.get('email')
        password = attrs.get('password')

        if not password:
            raise serializers.ValidationError({'password': 'This field is required.'})

        login_identifier = username if username else email
        if not login_identifier:
            raise serializers.ValidationError({'detail': 'Must provide either "username" or "email".'})

        user = authenticate(
            request=self.context.get('request'),
            username=login_identifier,
            password=password
        )

        if not user:
            raise serializers.ValidationError({'detail': 'Invalid credentials.'}, code='authorization')

        self.user = user
        attrs['username'] = user.username

        data = super().validate(attrs)
        data['user'] = UserSerializer(user).data

        print("Login successful, returning:", data)
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# ───────────────────────────────────────────────
# ViewSets
# ───────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Super Admin':
            return User.objects.all()
        return User.objects.filter(pk=user.pk)


class CommunityViewSet(viewsets.ModelViewSet):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsCommunityAdminOrSuperAdmin()]
        if self.action == 'generate_invite':
            return [IsCommunityAdminOrSuperAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Community.objects.none()
        if user.role == 'Super Admin':
            return Community.objects.all()
        return Community.objects.filter(members=user)

    def perform_create(self, serializer):
        community = serializer.save()
        community.members.add(self.request.user)

    def list(self, request, *args, **kwargs):
        user = request.user
        if user.role == 'Super Admin':
            parents = Community.objects.filter(parent__isnull=True)
        else:
            parents = Community.objects.filter(parent__isnull=True, members=user)

        parents = parents.prefetch_related('sub_communities')

        result = []
        for parent in parents:
            result.append({
                "id": str(parent.id),
                "name": parent.name,
                "member_count": parent.member_count,
                "subCommunities": [
                    {
                        "id": str(child.id),
                        "name": child.name,
                        "member_count": child.member_count
                    }
                    for child in parent.sub_communities.all()
                ]
            })
        return Response(result)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        community = self.get_object()
        user = request.user

        if user in community.members.all():
            return Response({"status": "already a member"}, status=200)

        community.members.add(user)
        return Response({"status": "joined successfully"})

    @action(detail=True, methods=['post'], url_path='generate-invite')
    def generate_invite(self, request, pk=None):
        community = self.get_object()

        # Permission already enforced by get_permissions()
        # You can add extra logging if needed:
        # print(f"Invite generated by {request.user} ({request.user.role}) for {community.name}")

        role = request.data.get('role', 'Member')
        allowed_roles = ['Member', 'Admin', 'Guest', 'Super Admin']  # adjust as needed
        if role not in allowed_roles:
            return Response(
                {"detail": f"Invalid role. Allowed values: {', '.join(allowed_roles)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = request.data.get('email')

        code = get_random_string(length=10).upper()

        with transaction.atomic():
            invite = CommunityInvite.objects.create(
                code=code,
                community=community,
                role=role,
                email=email,
                invited_by=request.user,
                # Recommended: add expiration
                # expires_at=timezone.now() + timezone.timedelta(days=7)
            )

        invite_link = f"{settings.FRONTEND_URL.rstrip('/')}/signup?invite={code}"

        if email:
            try:
                send_mail(
                    subject=f'Invitation to join {community.name}',
                    message=f'''Hi,

You've been invited to join "{community.name}" as {role}.

Join here: {invite_link}

Best regards,
Assign Alert Team''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=True,  # ← important: don't crash API if email fails
                )
            except Exception as e:
                print(f"Email failed for invite {code}: {e}")  # replace with logger

        return Response({
            "invite_link": invite_link,
            "code": code
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        community = self.get_object()
        user = request.user

        if user in community.members.all():
            community.members.remove(user)
            return Response({"status": "left community"})
        return Response({"status": "not a member"}, status=200)


# Other ViewSets (minimal fixes)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    lookup_field = 'pk'
    lookup_url_kwarg = 'pk'

    def get_queryset(self):
        user = self.request.user
        if user.role in ['Super Admin', 'Admin']:
            return Task.objects.all()
        return Task.objects.filter(
            models.Q(community__members=user) |
            models.Q(is_personal=True, assignee=str(user.pk))
        )

    def perform_create(self, serializer):
        serializer.save(assignee=str(self.request.user.pk))


class EpicViewSet(viewsets.ModelViewSet):
    queryset = Epic.objects.all()
    serializer_class = EpicSerializer
    permission_classes = [IsAuthenticated]


class SprintViewSet(viewsets.ModelViewSet):
    queryset = Sprint.objects.all()
    serializer_class = SprintSerializer
    permission_classes = [IsAuthenticated]


class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Alert.objects.filter(user=str(self.request.user.pk))


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)