# backend/users/permissions.py
from rest_framework.permissions import BasePermission

class IsTIUser(BasePermission):
    """
    Permite acceso solo a usuarios con el rol de TI.
    """
    def has_permission(self, request, view):
        # Verifica que el usuario esté autenticado y tenga perfil y el rol correcto
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.roles.filter(name='TI').exists()
        )

class IsClinicaUser(BasePermission):
    """
    Permite acceso solo a usuarios con el rol de Clinica.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.roles.filter(name='CLINICA').exists()
        )

class IsComercialUser(BasePermission):
    """
    Permite acceso solo a usuarios con el rol de Comercial.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.roles.filter(name='COMERCIAL').exists()
        )

class IsAdminUser(BasePermission):
    """
    Permite acceso solo a usuarios con el rol de Admin.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.roles.filter(name='ADMIN').exists()
        )

class IsAdministracionUser(BasePermission):
    """
    Permite acceso solo a usuarios con el rol de Administracion.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.roles.filter(name='ADMINISTRACION').exists()
        )

class CanApproveAsManager(BasePermission):
    """
    Permite aprobar/rechazar si el usuario es el approver_assigned
    y el estado es PENDING_MANAGER.
    """
    def has_object_permission(self, request, view, obj):
        return obj.approver_assigned == request.user and obj.status == 'PENDING_MANAGER'

class CanApproveAsPurchasing(BasePermission):
    """
    Permite aprobar/rechazar si el usuario tiene rol ADMINISTRACION (o COMPRAS)
    y el estado es PENDING_PURCHASING.
    """
    def has_object_permission(self, request, view, obj):
        has_purchasing_role = (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.roles.filter(name='ADMINISTRACION').exists()
        )
        return has_purchasing_role and obj.status == 'PENDING_PURCHASING'