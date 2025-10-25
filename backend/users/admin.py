# backend/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Profile, Role

# Define un Inline para el Profile, para mostrarlo dentro del User admin
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Perfil'
    # 👇 AÑADE ESTA LÍNEA especificando el campo que relaciona Profile con User
    fk_name = 'user'
    # Asegúrate de incluir 'manager' en los campos editables
    fields = ('full_name', 'roles', 'manager')
    filter_horizontal = ('roles',) # Widget más amigable para ManyToMany

# Define un nuevo User admin
class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)
    list_display = ('username', 'email', 'get_full_name', 'get_manager', 'is_staff') # Reordenado y añadido get_manager
    list_select_related = ('profile', 'profile__manager') # Optimiza la consulta para profile y manager

    # Método para mostrar el nombre completo del perfil en la lista
    @admin.display(description='Nombre Completo', ordering='profile__full_name') # Añadido ordering
    def get_full_name(self, instance):
        # Usar getattr para seguridad si el perfil no existe
        return getattr(getattr(instance, 'profile', None), 'full_name', '')

    # Método para mostrar el manager en la lista
    @admin.display(description='Jefe Directo', ordering='profile__manager__username') # Añadido ordering
    def get_manager(self, instance):
         # Usar getattr anidado para seguridad
         manager = getattr(getattr(instance, 'profile', None), 'manager', None)
         return manager.username if manager else 'N/A'


# Re-registra el User model con el UserAdmin personalizado
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Registra Role si quieres administrarlo desde el admin
@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name',)

# No registres Profile por separado si usas el Inline
# admin.site.register(Profile)
