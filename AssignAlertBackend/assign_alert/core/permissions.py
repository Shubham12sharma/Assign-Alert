# core/permissions.py
from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    """
    Allows access only to users with role 'Super Admin'.
    """

    message = "Only Super Admins are allowed to perform this action."

    def has_permission(self, request, view):
        # User must be authenticated and have role 'Super Admin'
        return (
            request.user.is_authenticated
            and hasattr(request.user, 'role')
            and request.user.role == 'Super Admin'
        )

    # Optional: You can also add object-level permission if needed in future
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)