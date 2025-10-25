# backend/users/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile, Role
from auditing.models import ActivityLog
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['name']

class UserSerializer(serializers.ModelSerializer):
    roles = serializers.ListField(child=serializers.CharField(), write_only=True)
    
    nombre = serializers.CharField(write_only=True, required=True)
    apellido_paterno = serializers.CharField(write_only=True, required=True)
    apellido_materno = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'roles', 
            'nombre', 'apellido_paterno', 'apellido_materno'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        roles_data = validated_data.pop('roles')
        
        nombre_data = validated_data.pop('nombre')
        apellido_p_data = validated_data.pop('apellido_paterno')
        apellido_m_data = validated_data.pop('apellido_materno', '')
        
        user = User.objects.create_user(**validated_data)
        
        profile = Profile.objects.create(
            user=user, 
            nombre=nombre_data,
            apellido_paterno=apellido_p_data,
            apellido_materno=apellido_m_data
        )

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
            profile = user.profile
            token['roles'] = [role.name for role in profile.roles.all()]
            token['full_name'] = profile.full_name 
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
    manager_username = serializers.CharField(source='manager.username', read_only=True, allow_null=True)
    manager = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        allow_null=True,
        required=False
    )

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Profile
        fields = [
            'roles', 
            'full_name',
            'nombre', 'apellido_paterno', 'apellido_materno',
            'manager', 
            'manager_username'
        ]


class UserDetailSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'profile'] # Asegúrate que 'username' está aquí si es editable

    def update(self, instance, validated_data):
        request_user = self.context['request'].user
        profile_data = validated_data.pop('profile', None)

        # Actualiza el username si se envió directamente
        instance.username = validated_data.get('username', instance.username)

        if profile_data:
            profile, created = Profile.objects.get_or_create(user=instance)

            # Actualiza roles (con validación anti-auto-remoción de ADMIN)
            if 'roles' in profile_data:
                new_roles_queryset = profile_data.get('roles') # Esto será un QuerySet o lista de instancias de Role
                new_roles_names = [role.name for role in new_roles_queryset] # Obtenemos los nombres

                is_editing_self = instance == request_user
                has_admin_role_before = profile.roles.filter(name='ADMIN').exists()
                will_have_admin_role_after = 'ADMIN' in new_roles_names

                if is_editing_self and has_admin_role_before and not will_have_admin_role_after:
                     raise serializers.ValidationError({"detail": "No puedes quitarte tu propio rol de ADMIN."})

                profile.roles.set(new_roles_queryset) # Asigna el queryset directamente

            if 'nombre' in profile_data:
                profile.nombre = profile_data.get('nombre', profile.nombre)
            if 'apellido_paterno' in profile_data:
                profile.apellido_paterno = profile_data.get('apellido_paterno', profile.apellido_paterno)
            if 'apellido_materno' in profile_data:
                profile.apellido_materno = profile_data.get('apellido_materno', profile.apellido_materno)

            # Actualiza manager (usando la instancia obtenida por PrimaryKeyRelatedField)
            if 'manager' in profile_data:
                manager_instance = profile_data.get('manager') # Sera la instancia User o None
                if manager_instance == instance:
                    raise serializers.ValidationError({"detail": "Un usuario no puede ser su propio jefe."})
                profile.manager = manager_instance

            profile.save()

        instance.save()

        ActivityLog.objects.create(
            user=request_user,
            action="Update User",
            details=f"User {instance.username} updated."
        )
        return instance 