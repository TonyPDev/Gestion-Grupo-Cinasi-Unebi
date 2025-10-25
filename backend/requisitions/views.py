from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from users.permissions import *
from auditing.models import ActivityLog
from .models import Requisicion 
from .serializers import RequisicionSerializer 

# Create your views here.
class RequisicionViewSet(viewsets.ModelViewSet):
    queryset = Requisicion.objects.all().order_by('-fecha_solicitud')
    serializer_class = RequisicionSerializer
    permission_classes = [IsAuthenticated, IsAdministracionUser | IsAdminUser] # Ejemplo

    # Puedes sobreescribir perform_create, perform_update, perform_destroy
    # para añadir lógica extra o logs como en UnebiKeyViewSet
    def perform_destroy(self, instance):
        ActivityLog.objects.create(
            user=self.request.user,
            action="Delete Requisicion",
            details=f"Requisición Folio: {instance.folio} eliminada."
        )
        instance.delete()