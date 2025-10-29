# backend/requisitions/serializers.py
from rest_framework import serializers
from auditing.models import ActivityLog
from .models import Requisicion, RequisicionItem
from django.utils import timezone # Para fechas de aprobación

class RequisicionItemSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False) # Permite enviar ID para actualizar, pero no es obligatorio al crear

    class Meta:
        model = RequisicionItem
        fields = ['id', 'partida_num', 'cantidad', 'unidad', 'producto']
        # No ponemos read_only_fields para permitir actualizaciones,
        # pero 'id' es opcional y 'partida_num' se recalculará si es necesario.


class RequisicionSerializer(serializers.ModelSerializer):
    items = RequisicionItemSerializer(many=True, required=True)
    creado_por_username = serializers.CharField(source='creado_por.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    approver_assigned_username = serializers.CharField(source='approver_assigned.username', read_only=True, allow_null=True)
    approved_by_manager_username = serializers.CharField(source='approved_by_manager.username', read_only=True, allow_null=True)
    approved_by_purchasing_username = serializers.CharField(source='approved_by_purchasing.username', read_only=True, allow_null=True)

    approver_assigned_full_name = serializers.CharField(source='approver_assigned.profile.full_name', read_only=True, allow_null=True, default='')
    approved_by_manager_full_name = serializers.CharField(source='approved_by_manager.profile.full_name', read_only=True, allow_null=True, default='')
    approved_by_purchasing_full_name = serializers.CharField(source='approved_by_purchasing.profile.full_name', read_only=True, allow_null=True, default='')
    creado_por_full_name = serializers.CharField(source='creado_por.profile.full_name', read_only=True, allow_null=True, default='')

    current_user_id = serializers.SerializerMethodField()

    class Meta:
        model = Requisicion
        fields = [
            'id', 'folio', 'fecha_solicitud', 'tipo_requisicion', 'justificacion',
            'nombre_solicitante', # Nombre escrito por el usuario
            'creado_por', 'creado_por_username', 'creado_por_full_name', # Datos del creador real
            'fecha_creacion', 'items',
            'status', 'status_display',
            'approver_assigned', 'approver_assigned_username', 'approver_assigned_full_name', # Aprobador actual
            'approved_by_manager', 'approved_by_manager_username', 'approved_by_manager_full_name', # Aprobador Jefe
            'manager_approval_date',
            'approved_by_purchasing', 'approved_by_purchasing_username', 'approved_by_purchasing_full_name', # Aprobador Compras
            'purchasing_approval_date',
            'rejection_reason',
            'current_user_id'
        ]
        read_only_fields = [
            'folio', 'creado_por', 'fecha_creacion',
            'status', 'status_display',
            'approver_assigned', 'approver_assigned_username', 'approver_assigned_full_name', # Asignado automáticamente
            'approved_by_manager', 'approved_by_manager_username', 'approved_by_manager_full_name', # Datos aprobación Jefe
            'manager_approval_date',
            'approved_by_purchasing', 'approved_by_purchasing_username', 'approved_by_purchasing_full_name', # Datos aprobación Compras
            'purchasing_approval_date',
            'creado_por_username', 'creado_por_full_name', # Datos del creador
            'rejection_reason',
            'current_user_id'
        ]
        # 'approver_assigned' y otros campos relacionados con la aprobación se quitan de read_only_fields
        # porque aunque no los mande el usuario al crear/editar, sí se leen.


    def get_current_user_id(self, obj):
        request = self.context.get('request', None)
        if request and hasattr(request, "user"):
            return request.user.id
        return None

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Debe proporcionar al menos un item.")
        # Podrías añadir más validaciones por item aquí si es necesario
        partida_nums = set()
        for i, item in enumerate(items):
             # Asignamos partida_num secuencialmente aquí para asegurar consistencia
            item['partida_num'] = i + 1
            if item['partida_num'] in partida_nums:
                 raise serializers.ValidationError(f"Número de partida duplicado: {item['partida_num']}")
            partida_nums.add(item['partida_num'])
            # Validar cantidad > 0, etc.
            if item['cantidad'] <= 0:
                 raise serializers.ValidationError(f"La cantidad para el item {item['partida_num']} debe ser positiva.")
        return items


    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        validated_data['creado_por'] = user

        # La lógica de asignar approver_assigned ya está en el modelo save()
        # Creamos la instancia pero aún no llamamos a save() para que se ejecute la lógica del folio/approver
        requisicion = Requisicion(**validated_data)
        # Forzamos la asignación del approver antes del primer save si no lo hizo el modelo
        if not requisicion.approver_assigned and requisicion.creado_por:
             try:
                 profile = requisicion.creado_por.profile
                 if profile.manager:
                     requisicion.approver_assigned = profile.manager
                     requisicion.status = 'PENDING_MANAGER'
             except requisicion.creado_por.profile.RelatedObjectDoesNotExist:
                 pass # Ya se manejó en el modelo o se loggea la advertencia

        requisicion.save() # Ahora sí guarda, llamando al save() del modelo

        # Crear los items
        for item_data in items_data:
            RequisicionItem.objects.create(requisicion=requisicion, **item_data)

        ActivityLog.objects.create(
            user=user,
            action="Create Requisicion",
            details=f"Requisición creada con Folio: {requisicion.folio}"
        )
        return requisicion

    def update(self, instance, validated_data):
        # Restricción opcional: Solo permitir editar si está en Borrador o Rechazada
        if instance.status not in ['PENDING_MANAGER', 'REJECTED']:
           raise serializers.ValidationError({
               "detail": "No se puede modificar una requisición aprobada, por favor refresca la página"
           })

        user = self.context['request'].user
        if instance.creado_por != user:
             raise serializers.ValidationError({
                 "detail": "No tienes permiso para editar esta requisición."
             })
        
        items_data = validated_data.pop('items', None)
        user = self.context['request'].user

        # Actualiza campos normales de Requisicion
        # Usamos setattr para actualizar solo los campos provistos en validated_data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Si se enviaron items, actualizamos (estrategia: borrar y recrear)
        if items_data is not None:
            # Validar los items de nuevo antes de borrar/crear
            items_data = self.validate_items(items_data)

            # Borrar items existentes asociados a esta requisición
            instance.items.all().delete()
            # Crear los nuevos items
            for item_data in items_data:
                item_data.pop('id', None) # Quitar ID si viene del frontend para evitar errores
                RequisicionItem.objects.create(requisicion=instance, **item_data)

        # Si fue rechazada y se edita, podríamos regresarla a PENDING_MANAGER
        if instance.status == 'REJECTED':
             instance.status = 'PENDING_MANAGER'
             # Reasignar al manager original (o buscarlo de nuevo)
             try:
                 instance.approver_assigned = instance.creado_por.profile.manager
             except (AttributeError, instance.creado_por.profile.RelatedObjectDoesNotExist):
                 instance.approver_assigned = None # O manejar diferente
             instance.rejection_reason = None # Limpiar motivo de rechazo

        instance.save() # Guardar los cambios en la requisición

        ActivityLog.objects.create(
            user=user,
            action="Update Requisicion",
            details=f"Requisición actualizada con Folio: {instance.folio}"
        )
        return instance
