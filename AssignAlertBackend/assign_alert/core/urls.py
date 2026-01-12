# core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    UserViewSet, CommunityViewSet, TaskViewSet,
    EpicViewSet, SprintViewSet, AlertViewSet,
    CustomTokenObtainPairView, MeView
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'communities', CommunityViewSet, basename='community')
router.register(r'tasks', TaskViewSet)
router.register(r'epics', EpicViewSet)
router.register(r'sprints', SprintViewSet)
router.register(r'alerts', AlertViewSet)

urlpatterns = [
    # All model APIs under the current prefix (/api/ from project urls.py)
    path('', include(router.urls)),

    # JWT login endpoints — ADD THEM HERE!
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Current user
    path('me/', MeView.as_view(), name='me'),
]