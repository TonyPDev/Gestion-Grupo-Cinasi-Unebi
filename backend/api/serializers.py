from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile, Role
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['name']

class UserSerializer(serializers.ModelSerializer):
    roles = serializers.ListField(
        child=serializers.CharField(), write_only=True
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'roles']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
       # Sacamos el rol de los datos validados antes de crear el usuario
        roles_data = validated_data.pop('roles')
        # Creamos el usuario solo con sus datos ('username', 'password')
        user = User.objects.create_user(**validated_data)
        profile = Profile.objects.create(user=user)
        # Asignamos los roles
        roles = Role.objects.filter(name__in=roles_data)
        profile.roles.set(roles)
        return user
    

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['user_id'] = user.id
        try:
            #Se envía una lista de roles
            token['roles'] = [role.name for role in user.profile.roles.all()]
        except user._meta.model.profile.RelatedObjectDoesNotExist:
            # Manejar el caso de que un usuario no tenga perfil
            token['roles'] = []
        return token
    
# Serializer para el perfil (al listar/editar)
class ProfileSerializer(serializers.ModelSerializer):
    roles = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Role.objects.all()
    )

    class Meta:
        model = Profile
        fields = ['roles']

# Serializer para listar y actualizar usuarios
class UserDetailSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'profile']

    def update(self, instance, validated_data):
        # El usuario que hace la petición (el admin logueado)
        request_user = self.context['request'].user
        
        # Obtenemos los datos del perfil del JSON ya validado
        profile_data = validated_data.pop('profile', None)
        
        # Si se enviaron datos del perfil, procedemos a actualizar los roles
        if profile_data:
            new_roles = profile_data.get('roles')

            # Si el usuario que se edita es el mismo que está logueado y se está quitando el rol de ADMIN
            if instance == request_user and not any(role.name == 'ADMIN' for role in new_roles):
                raise serializers.ValidationError({"detail": "No puedes quitarte tu propio rol de ADMIN."})

            # Obtenemos o creamos el perfil y le asignamos los nuevos roles
            profile, created = Profile.objects.get_or_create(user=instance)
            profile.roles.set(new_roles)

        # Finalmente, actualizamos el resto de los campos del usuario, como el username
        return super().update(instance, validated_data)