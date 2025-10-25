from rest_framework import serializers
from auditing.models import ActivityLog
from .models import Requisicion, RequisicionItem

class RequisicionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequisicionItem
        fields = ['id', 'partida_num', 'cantidad', 'unidad', 'producto']

class RequisicionSerializer(serializers.ModelSerializer):
    items = RequisicionItemSerializer(many=True)
    creado_por_username = serializers.CharField(source='creado_por.username', read_only=True)

    class Meta:
        model = Requisicion
        fields = [
            'id', 'folio', 'fecha_solicitud', 'tipo_requisicion', 'justificacion',
            'nombre_solicitante', 'fecha_firma_solicitante', 'nombre_autoriza',
            'fecha_firma_autoriza', 'creado_por', 'creado_por_username',
            'fecha_creacion', 'items'
        ]
        read_only_fields = ['folio', 'creado_por', 'fecha_creacion', 'creado_por_username']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        # Asigna el usuario que crea la requisición
        validated_data['creado_por'] = self.context['request'].user
        requisicion = Requisicion.objects.create(**validated_data)
        for item_data in items_data:
            RequisicionItem.objects.create(requisicion=requisicion, **item_data)

        # Registro de actividad (opcional pero recomendado)
        ActivityLog.objects.create(
            user=self.context['request'].user,
            action="Create Requisicion",
            details=f"Requisición creada con Folio: {requisicion.folio}"
        )
        return requisicion

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        # Actualiza campos de Requisicion
        instance = super().update(instance, validated_data)

        # Actualiza/Crea/Elimina items si se proporcionan
        if items_data is not None:
            # Simple estrategia: eliminar existentes y crear nuevos
            instance.items.all().delete()
            for item_data in items_data:
                RequisicionItem.objects.create(requisicion=instance, **item_data)

        # Registro de actividad (opcional)
        ActivityLog.objects.create(
            user=self.context['request'].user,
            action="Update Requisicion",
            details=f"Requisición actualizada con Folio: {instance.folio}"
        )
        return instance
