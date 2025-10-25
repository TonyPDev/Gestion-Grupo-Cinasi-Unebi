from rest_framework import serializers
from .models import UnebiKey
from datetime import datetime

class UnebiKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = UnebiKey
        fields = '__all__'
        read_only_fields = ['historial']

    def create(self, validated_data):
        user = self.context['request'].user
        full_name = user.profile.full_name or user.username
        timestamp = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        validated_data['historial'] = f"Creada el {timestamp} por: {full_name}"
        return super().create(validated_data)

    def update(self, instance, validated_data):
        user = self.context['request'].user
        full_name = user.profile.full_name or user.username
        timestamp = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        changes = []
        for attr, value in validated_data.items():
            old_value = getattr(instance, attr)
            if str(old_value) != str(value):
                changes.append(f"- Campo '{attr}': de '{old_value}' a '{value}'")
        if changes:
            change_log = f"\n--- Actualizado el {timestamp} por: {full_name} ---\n" + "\n".join(changes)
            validated_data['historial'] = instance.historial + change_log
        return super().update(instance, validated_data)