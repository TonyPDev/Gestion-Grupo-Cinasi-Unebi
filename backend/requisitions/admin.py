from django.contrib import admin
from .models import Requisicion, RequisicionItem 

# Register your models here.
class RequisicionItemInline(admin.TabularInline):
    model = RequisicionItem
    extra = 1 # Cuántos formularios de item vacíos mostrar

class RequisicionAdmin(admin.ModelAdmin):
    list_display = ('folio', 'fecha_solicitud', 'tipo_requisicion', 'nombre_solicitante', 'creado_por', 'fecha_creacion')
    list_filter = ('tipo_requisicion', 'fecha_solicitud', 'creado_por')
    search_fields = ('folio', 'justificacion', 'nombre_solicitante', 'items__producto')
    inlines = [RequisicionItemInline]
    readonly_fields = ('folio', 'creado_por', 'fecha_creacion')

admin.site.register(Requisicion, RequisicionAdmin)