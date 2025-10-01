from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, NoteSerializer, MyTokenObtainPairSerializer, UserDetailSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import *

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class NoteListCreate (generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author = user)
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)
        return
    
class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author = user)

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