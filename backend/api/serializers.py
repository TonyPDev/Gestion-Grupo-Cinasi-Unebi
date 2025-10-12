from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile, Role, UnebiKey, ActivityLog
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from datetime import datetime

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['name']
class UserSerializer(serializers.ModelSerializer):
    roles = serializers.ListField(child=serializers.CharField(), write_only=True)
    full_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'roles', 'full_name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        roles_data = validated_data.pop('roles')
        full_name_data = validated_data.pop('full_name', '')
        user = User.objects.create_user(**validated_data)
        profile = Profile.objects.create(user=user, full_name=full_name_data)
        roles = Role.objects.filter(name__in=roles_data)
        profile.roles.set(roles)
        
        ActivityLog.objects.create(
            user=self.context['request'].user,
            action="Create User",
            details=f"User {user.username} created."
        )
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['user_id'] = user.id
        try:
            token['roles'] = [role.name for role in user.profile.roles.all()]
            token['full_name'] = user.profile.full_name
        except user._meta.model.profile.RelatedObjectDoesNotExist:
            token['roles'] = []
            token['full_name'] = ''
        return token

class ProfileSerializer(serializers.ModelSerializer):
    roles = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Role.objects.all()
    )

    class Meta:
        model = Profile
        fields = ['roles', 'full_name']

class UserDetailSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'profile']

    def update(self, instance, validated_data):
        request_user = self.context['request'].user
        profile_data = validated_data.pop('profile', None)
        
        # --- LÓGICA DE ACTUALIZACIÓN CORREGIDA ---
        if profile_data:
            profile, created = Profile.objects.get_or_create(user=instance)
            
            # Actualiza los roles si se proporcionan
            if 'roles' in profile_data:
                new_roles = profile_data.get('roles')
                if instance == request_user and not any(role.name == 'ADMIN' for role in new_roles):
                    raise serializers.ValidationError({"detail": "No puedes quitarte tu propio rol de ADMIN."})
                profile.roles.set(new_roles)

            # Actualiza el nombre completo si se proporciona
            if 'full_name' in profile_data:
                profile.full_name = profile_data.get('full_name', profile.full_name)
            
            profile.save()

        ActivityLog.objects.create(
            user=request_user,
            action="Update User",
            details=f"User {instance.username} updated."
        )
        return super().update(instance, validated_data)

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


class ActivityLogSerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source='user.profile.full_name', read_only=True, default='')
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'user_username', 'user_full_name', 'action', 'details', 'timestamp']
