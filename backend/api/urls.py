from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'unebikeys', views.UnebiKeyViewSet, basename='unebikey')
router.register(r'requisiciones', views.RequisicionViewSet, basename='requisicion')

urlpatterns = [
    path("users/me/", views.CurrentUserView.as_view(), name="current-user"),
    path("users/", views.UserListView.as_view(), name="user-list"),
    path("users/<int:pk>/", views.UserDetailView.as_view(), name="user-detail"),
    path("users/delete/<int:pk>/", views.UserDeleteView.as_view(), name="user-delete"),
    path("activity-logs/", views.ActivityLogListView.as_view(), name="activity-log-list"),
    
    path('', include(router.urls)),
]