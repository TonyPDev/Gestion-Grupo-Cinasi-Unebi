from django.shortcuts import render
from rest_framework import viewsets
from .serializers import UnebiKeySerializer
from rest_framework.permissions import IsAuthenticated
from users.permissions import *
from .models import UnebiKey
from auditing.models import ActivityLog

# Create your views here.
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