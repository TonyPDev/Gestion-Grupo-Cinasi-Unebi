from rest_framework.permissions import BasePermission

class IsTIUser(BasePermission):
    """
    Permite acceso solo a usuarios con el rol de TI.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.role == 'TI'

class IsClinicaUser(BasePermission):
    """
    Permite acceso solo a usuarios con el rol de Clinica.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.role == 'CLINICA'

class IsComercialUser(BasePermission):
    """
    Permite acceso solo a usuarios con el rol de Comercial.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.role == 'COMERCIAL'
    
class IsAdminUser(BasePermission):
    """
    Permite acceso solo a usuarios con el rol de Admin.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.role == 'ADMIN'