from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note, Profile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=Profile.ROLE_CHOICES, write_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
       # Sacamos el rol de los datos validados antes de crear el usuario
        role_data = validated_data.pop('role')
        # Creamos el usuario solo con sus datos ('username', 'password')
        user = User.objects.create_user(**validated_data)
        # Creamos el perfil asociado al usuario con el rol especificado
        Profile.objects.create(user=user, role=role_data)
        return user
    
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}}

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        try:
            token['role'] = user.profile.role
        except user._meta.model.profile.RelatedObjectDoesNotExist:
            # Manejar el caso de que un usuario no tenga perfil
            token['role'] = None
        return token
    
# Serializer para mostrar el perfil junto con el usuario
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['role']

# Serializer para listar y actualizar usuarios
class UserDetailSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'profile']

    def update(self, instance, validated_data):
        # Obtenemos los datos del perfil del JSON de entrada
        profile_data = validated_data.pop('profile')
        # Obtenemos el perfil del usuario a actualizar
        profile = instance.profile

        # Actualizamos el usuario (si se cambian otros campos como username)
        instance.username = validated_data.get('username', instance.username)
        instance.save()

        # Actualizamos el rol en el perfil
        profile.role = profile_data.get('role', profile.role)
        profile.save()

        return instance