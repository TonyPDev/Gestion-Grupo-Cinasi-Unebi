from django.contrib.auth.models import User
from rest_framework import generics, status, viewsets
from .serializers import UserSerializer, MyTokenObtainPairSerializer, UserDetailSerializer, UnebiKeySerializer, ActivityLogSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from .permissions import *
from .models import UnebiKey, ActivityLog

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance == request.user:
            return Response(
                {"detail": "No puedes eliminar tu propia cuenta de administrador"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        ActivityLog.objects.create(
            user=request.user,
            action="Delete User",
            details=f"User '{instance.username}' deleted."
        )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class UnebiKeyViewSet(viewsets.ModelViewSet):
    queryset = UnebiKey.objects.all()
    serializer_class = UnebiKeySerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            self.permission_classes = [IsAuthenticated, (IsComercialUser | IsTIUser | IsAdminUser)]
        elif self.action in ['update', 'partial_update']:
            self.permission_classes = [IsAuthenticated, (IsComercialUser | IsClinicaUser | IsTIUser | IsAdminUser)]
        return super().get_permissions()

    def perform_create(self, serializer):
        instance = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user,
            action="Create UnebiKey",
            details=f"New UnebiKey created with ID: {instance.id} and Clave Asignada: '{instance.clave_asignada}'"
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user,
            action="Update UnebiKey",
            details=f"UnebiKey ID: {instance.id} ('{instance.clave_asignada}') updated."
        )

    def perform_destroy(self, instance):
        ActivityLog.objects.create(
            user=self.request.user,
            action="Delete UnebiKey",
            details=f"UnebiKey ID: {instance.id} ('{instance.clave_asignada}') deleted."
        )
        instance.delete()

class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        queryset = ActivityLog.objects.all().order_by('-timestamp')
        action_type = self.request.query_params.get('action', None)
        if action_type is not None:
            queryset = queryset.filter(action=action_type)
        return queryset