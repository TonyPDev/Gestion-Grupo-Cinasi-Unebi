from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status
from .serializers import UserSerializer, MyTokenObtainPairSerializer, UserDetailSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from .permissions import *

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class VistaClinica(generics.ListAPIView):
    permission_classes = [IsAuthenticated, (IsClinicaUser | IsAdminUser)]

class VistaTI(generics.ListAPIView):
    permission_classes = [IsAuthenticated, (IsTIUser | IsAdminUser)]

class VistaComercial(generics.ListAPIView):
    permission_classes = [IsAuthenticated, (IsComercialUser | IsAdminUser)]

# Vista para listar todos los usuarios (solo para admin)
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

# Vista para recuperar y actualizar un usuario (solo para TI)
class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance == request.user:
            return Response(
                {"detail": "No puedes eliminar tu propia cuenta de administrador"},
                status=status.HTTP_404_FORBIDDEN
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)