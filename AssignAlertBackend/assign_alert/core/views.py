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
from .models import User, Community, Task, Epic, Sprint, Alert, CommunityInvite,Comment
from .serializers import (
    UserSerializer, CommunitySerializer, TaskSerializer,
    EpicSerializer, SprintSerializer, AlertSerializer, MinimalUserSerializer
)


# ───────────────────────────────────────────────
# Custom Permission Classes (recommended)
# ───────────────────────────────────────────────

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'Super Admin'


class IsCommunityAdminOrSuperAdmin(permissions.BasePermission):
    """
    With the simplified roles, only Super Admins are allowed to manage communities.
    Members can still view communities they belong to via standard viewset permissions.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'Super Admin'

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


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
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        """
        Main queryset filtering:
        - Super Admin → sees all users
        - Normal users → only see themselves
        """
        user = self.request.user
        if user.role == 'Super Admin':
            return User.objects.all()
        return User.objects.filter(pk=user.pk)

    # ───────────────────────────────────────────────
    # Custom action: minimal list for assignee dropdown
    # ───────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='minimal')
    def minimal(self, request):
        community_id = request.query_params.get('community')
        
        print(f"[User minimal] Requested by {request.user} | community={community_id}")
        
        if not community_id:
            print("[User minimal] No community ID provided")
            return Response({"detail": "community parameter is required"}, status=400)

        try:
            community = Community.objects.get(id=community_id)
            print(f"[User minimal] Community found: {community.name} ({community.id})")
        except Community.DoesNotExist:
            print(f"[User minimal] Community {community_id} not found")
            return Response({"detail": "Community not found"}, status=404)

        # Access control:
        # - Super Admin can see members of any community
        # - Members can only see members of communities they belong to
        if not (request.user.role == 'Super Admin' or community.members.filter(pk=request.user.pk).exists()):
            print(f"[User minimal] Access denied for {request.user} in {community_id}")
            return Response({"detail": "Not a member of this community"}, status=403)

        queryset = User.objects.filter(communities__id=community_id)
        print(f"[User minimal] Found {queryset.count()} members")

        # Use serializer → it will handle ObjectId → str conversion
        serializer = MinimalUserSerializer(queryset, many=True)
        return Response(serializer.data)

    # Optional: if you want to restrict who can see other users
    def list(self, request, *args, **kwargs):
        if request.user.role != 'Super Admin':
            # Members can only see themselves (or community members via the minimal endpoint)
            return Response(UserSerializer(request.user).data)
        return super().list(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        Allow only Super Admin to change user roles. Other profile fields can still
        be updated by the user themselves via /me/.
        """
        if 'role' in request.data and request.user.role != 'Super Admin':
            return Response(
                {"detail": "Only Super Admin can change user roles."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)


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
        allowed_roles = ['Member', 'Super Admin']
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
    permission_classes = [permissions.IsAuthenticated]

    lookup_field = 'pk'
    lookup_url_kwarg = 'pk'

    def get_queryset(self):
        """
        Visibility rules:
        - Super Admin: can see all tasks (optionally filtered by ?community=)
        - Members: can see
          - tasks in communities they belong to (optionally narrowed by ?community=)
          - their own personal tasks (is_personal=True and assignee=current user)
        """
        user = self.request.user

        # Start with all tasks and optionally narrow by community query param
        qs = Task.objects.all()
        community_id = self.request.query_params.get('community')
        if community_id:
            qs = qs.filter(community__id=community_id)

        if user.role == 'Super Admin':
            return qs

        # Get string IDs of communities the user is member of
        user_community_ids = list(
            user.communities.values_list('id', flat=True)
        )
        user_community_ids = [str(cid) for cid in user_community_ids]

        return qs.filter(
            models.Q(community__in=user_community_ids) |
            models.Q(is_personal=True, assignee=str(user.pk))
        )
    
    def perform_create(self, serializer):
        """
        Create a task and always set the assignee to the current user by default.
        Other validated fields (including sprint / epic / community) are saved normally.
        """
        serializer.save(assignee=str(self.request.user.pk))

    @action(detail=True, methods=['post'], url_path='comments')
    def comments(self, request, pk=None):
        task = self.get_object()

        # Optional: check permission (e.g. must be assignee or community member)
        if not (request.user == task.assignee or task.community.members.filter(id=request.user.id).exists()):
            return Response({"detail": "You do not have permission to comment on this task"}, status=403)

        # Get comment text from request
        text = request.data.get('text')
        if not text or not text.strip():
            return Response({"detail": "Comment text is required"}, status=400)

        # Create comment (assuming you have a Comment model)
        comment = Comment.objects.create(
            task=task,
            user=request.user,
            text=text.strip(),
            timestamp=timezone.now()
        )

        # Optional: update task's comments JSON field if you're using it
        if hasattr(task, 'comments') and isinstance(task.comments, list):
            task.comments.append({
                'id': str(comment.id),
                'user': request.user.username,
                'text': text,
                'timestamp': comment.timestamp.isoformat(),
            })
            task.save(update_fields=['comments'])

        # Return the created comment
        return Response({
            'id': str(comment.id),
            'user': request.user.username,
            'text': comment.text,
            'timestamp': comment.timestamp.isoformat(),
        }, status=status.HTTP_201_CREATED)

class EpicViewSet(viewsets.ModelViewSet):
    queryset = Epic.objects.all()
    serializer_class = EpicSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter epics by community when provided and restrict visibility:
        - Super Admin: can see all
        - Others: epics that belong to communities they are members of
        """
        user = self.request.user
        qs = Epic.objects.all()

        community_id = self.request.query_params.get('community')
        if community_id:
            qs = qs.filter(community=community_id)

        if user.role == 'Super Admin':
            return qs

        # User communities as string IDs (to match Epic.community CharField)
        user_community_ids = [str(cid) for cid in user.communities.values_list('id', flat=True)]
        return qs.filter(community__in=user_community_ids)


class SprintViewSet(viewsets.ModelViewSet):
    queryset = Sprint.objects.all()
    serializer_class = SprintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Support filtering:
        - ?epic=<epic_id>         → sprints linked to that epic
        - ?community=<community>  → sprints in that community
        Enforce basic visibility based on user's communities unless Super Admin.
        """
        user = self.request.user
        qs = Sprint.objects.all()

        epic_id = self.request.query_params.get('epic')
        community_id = self.request.query_params.get('community')

        if epic_id:
            qs = qs.filter(epic=epic_id)
        if community_id:
            qs = qs.filter(community=community_id)

        if user.role == 'Super Admin':
            return qs

        user_community_ids = [str(cid) for cid in user.communities.values_list('id', flat=True)]
        return qs.filter(community__in=user_community_ids)


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