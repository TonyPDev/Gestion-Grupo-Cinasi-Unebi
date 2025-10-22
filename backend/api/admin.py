from django.contrib import admin
from .models import Profile, Role, UnebiKey, ActivityLog

class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'timestamp', 'details')
    list_filter = ('action', 'user') 
    search_fields = ('user__username', 'details') 
admin.site.register(Profile)
admin.site.register(Role)
admin.site.register(UnebiKey)
admin.site.register(ActivityLog, ActivityLogAdmin) 
# admin.py
from .models import Profile, Role, UnebiKey, ActivityLog, Requisicion, RequisicionItem # Añade modelos

class RequisicionItemInline(admin.TabularInline):
    model = RequisicionItem
    extra = 1 # Cuántos formularios de item vacíos mostrar

class RequisicionAdmin(admin.ModelAdmin):
    list_display = ('folio', 'fecha_solicitud', 'tipo_requisicion', 'nombre_solicitante', 'creado_por', 'fecha_creacion')
    list_filter = ('tipo_requisicion', 'fecha_solicitud', 'creado_por')
    search_fields = ('folio', 'justificacion', 'nombre_solicitante', 'items__producto')
    inlines = [RequisicionItemInline]
    readonly_fields = ('folio', 'creado_por', 'fecha_creacion')

# ... (otros registros)
admin.site.register(Requisicion, RequisicionAdmin)
# admin.site.register(RequisicionItem) # No es necesario si se usa Inline