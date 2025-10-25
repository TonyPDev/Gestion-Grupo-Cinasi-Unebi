# backend/requisitions/views.py
from django.shortcuts import render
from django.db.models import Q # Para consultas OR
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, BasePermission # Import BasePermission
from rest_framework.decorators import action
from rest_framework.response import Response
from users.permissions import (
    IsAdminUser, IsAdministracionUser,
    CanApproveAsManager, CanApproveAsPurchasing
)
from auditing.models import ActivityLog
from .models import Requisicion, RequisicionItem # Asegúrate de importar RequisicionItem si no estaba
from .serializers import RequisicionSerializer
from django.utils import timezone
from django.contrib.auth.models import User # Para buscar usuarios

class RequisicionViewSet(viewsets.ModelViewSet):
    serializer_class = RequisicionSerializer
    permission_classes = [IsAuthenticated] # Permiso base, se refina en get_queryset y acciones

    def get_queryset(self):
        user = self.request.user

        # Manejo de caso si el usuario no tiene perfil (debería tenerlo, pero por seguridad)
        if not hasattr(user, 'profile'):
             # Decide qué hacer: ¿no mostrar nada? ¿lanzar error?
             # Por ahora, devolvemos un queryset vacío.
             return Requisicion.objects.none()

        # Los administradores ven todo
        if user.profile.roles.filter(name='ADMIN').exists():
            return Requisicion.objects.all().order_by('-fecha_creacion', '-id')

        # Usuarios de Compras (Administracion) ven PENDientes de COMPRAS, APROBADAS y RECHAZADAS
        if user.profile.roles.filter(name='ADMINISTRACION').exists():
            return Requisicion.objects.filter(
                Q(status='PENDING_PURCHASING') |
                Q(status='APPROVED') |
                Q(status='REJECTED')
            ).order_by('-fecha_creacion', '-id')

        # Query base: requisiciones creadas por el usuario
        my_requisitions = Q(creado_por=user)

        # Query adicional: requisiciones pendientes de la aprobación de este usuario (si es manager)
        pending_my_approval = Q(approver_assigned=user, status='PENDING_MANAGER')

        # Combinamos: El usuario ve las suyas + las que tiene pendientes de aprobar
        queryset = Requisicion.objects.filter(my_requisitions | pending_my_approval).distinct().order_by('-fecha_creacion', '-id')
        return queryset

    def perform_create(self, serializer):
        # El serializer y el modelo manejan la asignación inicial
        serializer.save()


    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanApproveAsManager | IsAdminUser]) # Admin también puede aprobar por jefe
    def approve_manager(self, request, pk=None):
        requisicion = self.get_object() # Obtiene la requisición usando pk
        user = request.user

        # Doble chequeo (aunque el permiso ya lo hace)
        if requisicion.status != 'PENDING_MANAGER':
            return Response({'error': 'Esta requisición no está pendiente de aprobación del jefe.'}, status=status.HTTP_400_BAD_REQUEST)
        # El permiso CanApproveAsManager ya valida que request.user sea el approver_assigned

        requisicion.approved_by_manager = user
        requisicion.manager_approval_date = timezone.now()
        requisicion.status = 'PENDING_PURCHASING'
        requisicion.approver_assigned = None # Limpiamos, ahora cualquier de compras puede tomarla

        requisicion.save()
        ActivityLog.objects.create(user=user, action="Approve Manager Requisicion", details=f"Requisición {requisicion.folio} aprobada por jefe.")
        # Devolvemos la requisición actualizada
        serializer = self.get_serializer(requisicion)
        return Response(serializer.data, status=status.HTTP_200_OK)


    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanApproveAsPurchasing | IsAdminUser])
    def approve_purchasing(self, request, pk=None):
        requisicion = self.get_object()
        user = request.user

        if requisicion.status != 'PENDING_PURCHASING':
            return Response({'error': 'Esta requisición no está pendiente de aprobación de compras.'}, status=status.HTTP_400_BAD_REQUEST)
        # El permiso CanApproveAsPurchasing valida el rol del usuario

        requisicion.approved_by_purchasing = user
        requisicion.purchasing_approval_date = timezone.now()
        requisicion.status = 'APPROVED'
        requisicion.approver_assigned = None # Flujo terminado
        requisicion.rejection_reason = None # Limpiamos por si fue rechazada antes
        requisicion.save()

        ActivityLog.objects.create(user=user, action="Approve Purchasing Requisicion", details=f"Requisición {requisicion.folio} aprobada por compras.")
        serializer = self.get_serializer(requisicion)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanApproveAsManager | CanApproveAsPurchasing | IsAdminUser ])
    def reject(self, request, pk=None):
        requisicion = self.get_object()
        user = request.user
        reason = request.data.get('rejection_reason', None) # Cambiado el nombre del campo esperado

        # Validar que se proporcionó un motivo
        if not reason:
             return Response({'error': 'Se requiere un motivo de rechazo (campo: rejection_reason).'}, status=status.HTTP_400_BAD_REQUEST)

        # Validar que el estado permite rechazo
        if requisicion.status not in ['PENDING_MANAGER', 'PENDING_PURCHASING']:
             return Response({'error': 'Esta requisición no se puede rechazar en su estado actual.'}, status=status.HTTP_400_BAD_REQUEST)

        requisicion.status = 'REJECTED'
        requisicion.rejection_reason = reason
        requisicion.approver_assigned = None # Flujo terminado
        # Guardamos quién rechazó y cuándo
        # Por ahora, el ActivityLog lo registra.
        requisicion.save()

        ActivityLog.objects.create(
            user=user,
            action="Reject Requisicion",
            details=f"Requisición {requisicion.folio} rechazada por {user.username}. Motivo: {reason}"
        )
        serializer = self.get_serializer(requisicion)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # El perform_destroy se mantiene igual
    def perform_destroy(self, instance):

        ActivityLog.objects.create(
            user=self.request.user,
            action="Delete Requisicion",
            details=f"Requisición Folio: {instance.folio} eliminada."
        )
        instance.delete()