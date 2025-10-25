# backend/requisitions/views.py
from django.shortcuts import render
from django.db.models import Q # Para consultas OR
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated # Quita BasePermission si no se usa directamente
from rest_framework.decorators import action
from rest_framework.response import Response
from users.permissions import (
    IsAdminUser, IsAdministracionUser,
    CanApproveAsManager, CanApproveAsPurchasing
)
from auditing.models import ActivityLog
from .models import Requisicion # Asegúrate que RequisicionItem no se importe si no se usa aquí
from .serializers import RequisicionSerializer
from django.utils import timezone
from django.contrib.auth.models import User # Para buscar usuarios

class RequisicionViewSet(viewsets.ModelViewSet):
    serializer_class = RequisicionSerializer
    permission_classes = [IsAuthenticated] # Permiso base

    def get_queryset(self):
        user = self.request.user

        # Manejo de caso si el usuario no tiene perfil
        if not hasattr(user, 'profile'):
             return Requisicion.objects.none()

        # 1. ADMIN ve todo
        if user.profile.roles.filter(name='ADMIN').exists():
            return Requisicion.objects.all().order_by('-fecha_creacion', '-id')

        # 2. ADMINISTRACION (Comercial en este flujo) ve las PENDientes de COMPRAS
        #    y también las ya APROBADAS o RECHAZADAS (para historial)
        if user.profile.roles.filter(name='ADMINISTRACION').exists():
            return Requisicion.objects.filter(
                Q(status='PENDING_PURCHASING') |
                Q(status='APPROVED') |
                Q(status='REJECTED')
            ).order_by('-fecha_creacion', '-id')

        # 3. JEFE DIRECTO (Manager)
        #    Ve las que tiene asignadas para aprobar (PENDING_MANAGER)
        #    y también las que él mismo creó (para seguimiento).
        requisitions_pending_my_approval = Q(approver_assigned=user, status='PENDING_MANAGER')
        my_own_requisitions = Q(creado_por=user) # El creador siempre ve las suyas

        # Verificamos si el usuario actual es jefe de alguien (tiene 'subordinates')
        # Esto es para que un jefe vea las requisiciones PENDientes de JEFE creadas por sus subordinados,
        # incluso si la lógica de asignación automática falló o no está implementada.
        # Es una capa extra de visibilidad para managers.
        subordinate_ids = user.subordinates.values_list('user__id', flat=True) # Obtiene IDs de usuarios subordinados
        requisitions_from_my_subordinates_pending = Q(creado_por_id__in=subordinate_ids, status='PENDING_MANAGER')

        # Combinamos: El jefe ve las suyas + las que tiene asignadas + las pendientes de sus subordinados
        # Los usuarios normales (que no son Jefes ni de Administración) solo verán las suyas.
        queryset = Requisicion.objects.filter(
            my_own_requisitions | requisitions_pending_my_approval | requisitions_from_my_subordinates_pending
        ).distinct().order_by('-fecha_creacion', '-id')

        return queryset


    def perform_create(self, serializer):
        # La lógica de asignación inicial del jefe (approver_assigned)
        # ya está en el método save() del modelo Requisicion.
        # Guardamos pasando el usuario actual al contexto del serializador.
        serializer.save(creado_por=self.request.user) # Aseguramos que creado_por se asigne

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, (IsAdministracionUser | IsAdminUser)])
    def all_requisitions(self, request):
        """
        Devuelve todas las requisiciones. Solo accesible por Admin y Administración.
        """
        queryset = Requisicion.objects.all().order_by('-fecha_creacion', '-id')
        # Aplicar paginación estándar si se desea, o devolver todo
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanApproveAsManager | IsAdminUser])
    def approve_manager(self, request, pk=None):
        requisicion = self.get_object()
        user = request.user

        if requisicion.status != 'PENDING_MANAGER':
            return Response({'error': 'Esta requisición no está pendiente de aprobación del jefe.'}, status=status.HTTP_400_BAD_REQUEST)

        # El permiso CanApproveAsManager valida que request.user sea el approver_assigned O el creador sea subordinado.
        # Ajustaremos CanApproveAsManager si es necesario.

        requisicion.approved_by_manager = user
        requisicion.manager_approval_date = timezone.now()
        requisicion.status = 'PENDING_PURCHASING' # <-- CORRECTO: Cambia a Pendiente Compras
        requisicion.approver_assigned = None # <-- CORRECTO: Limpiamos, ahora es para Administración/Comercial

        requisicion.save()
        ActivityLog.objects.create(user=user, action="Approve Manager Requisicion", details=f"Requisición {requisicion.folio} aprobada por jefe.")
        serializer = self.get_serializer(requisicion)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Las acciones approve_purchasing, reject y perform_destroy pueden permanecer igual
    # ... (resto de las acciones approve_purchasing, reject, perform_destroy) ...
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanApproveAsPurchasing | IsAdminUser])
    def approve_purchasing(self, request, pk=None):
        requisicion = self.get_object()
        user = request.user

        if requisicion.status != 'PENDING_PURCHASING':
            return Response({'error': 'Esta requisición no está pendiente de aprobación de compras.'}, status=status.HTTP_400_BAD_REQUEST)
        # El permiso CanApproveAsPurchasing valida el rol del usuario (ADMINISTRACION)

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
        reason = request.data.get('rejection_reason', None)

        if not reason:
             return Response({'error': 'Se requiere un motivo de rechazo (campo: rejection_reason).'}, status=status.HTTP_400_BAD_REQUEST)

        if requisicion.status not in ['PENDING_MANAGER', 'PENDING_PURCHASING']:
             return Response({'error': 'Esta requisición no se puede rechazar en su estado actual.'}, status=status.HTTP_400_BAD_REQUEST)

        # Determinar quién rechaza para registrar correctamente
        rejected_by_role = "desconocido"
        if CanApproveAsManager().has_object_permission(request, self, requisicion):
            rejected_by_role = "Jefe Directo"
        elif CanApproveAsPurchasing().has_object_permission(request, self, requisicion):
             rejected_by_role = "Compras"
        elif IsAdminUser().has_permission(request, self):
             rejected_by_role = "Admin"


        requisicion.status = 'REJECTED'
        requisicion.rejection_reason = reason
        requisicion.approver_assigned = None # Flujo terminado
        # Podríamos añadir campos para saber quién rechazó y cuándo si fuera necesario
        # requisicion.rejected_by = user
        # requisicion.rejection_date = timezone.now()
        requisicion.save()

        ActivityLog.objects.create(
            user=user,
            action="Reject Requisicion",
            details=f"Requisición {requisicion.folio} rechazada por {user.username} ({rejected_by_role}). Motivo: {reason}"
        )
        serializer = self.get_serializer(requisicion)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_destroy(self, instance):
        ActivityLog.objects.create(
            user=self.request.user,
            action="Delete Requisicion",
            details=f"Requisición Folio: {instance.folio} eliminada."
        )
        instance.delete()