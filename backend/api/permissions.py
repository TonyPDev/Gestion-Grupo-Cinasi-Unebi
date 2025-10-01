from rest_framework.permissions import BasePermission

class IsTIUser(BasePermission):
    """
    Permite acceso solo a usuarios con el rol de TI.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.roles.filter(name='TI').exists()

class IsClinicaUser(BasePermission):
    """
    Permite acceso solo a usuarios con el rol de Clinica.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.roles.filter(name='CLINICA').exists()

class IsComercialUser(BasePermission):
    """
    Permite acceso solo a usuarios con el rol de Comercial.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.roles.filter(name='COMERCIAL').exists()
    
class IsAdminUser(BasePermission):
    """
    Permite acceso solo a usuarios con el rol de Admin.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.roles.filter(name='ADMIN').exists()
    
class IsAdministracionUser(BasePermission):
    """
    Permite acceso solo a usuarios con el rol de Admin.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.roles.filter(name='ADMINISTRACION').exists()    