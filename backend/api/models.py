from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    roles = models.ManyToManyField(Role)

    def __str__(self):
        return f"{self.user.username} - Roles: {', '.join([role.name for role in self.roles.all()])}"


class UnebiKey(models.Model):
    elaborador = models.CharField(max_length=255, blank=True, null=True)
    tipo_estudio = models.CharField(max_length=255, blank=True, null=True)
    patrocinador = models.CharField(max_length=255, blank=True, null=True)
    principio_activo = models.TextField(blank=True, null=True)
    condicion = models.CharField(max_length=255, blank=True, null=True)
    orden_servicio = models.CharField(max_length=255, blank=True, null=True)
    fecha_solicitud = models.DateField(blank=True, null=True)
    clave_asignada = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=255, blank=True, null=True)
    tipo_proyecto = models.CharField(max_length=255, blank=True, null=True)
    comentarios = models.TextField(blank=True, null=True)
    llave_pago_cofepris = models.CharField(max_length=255, blank=True, null=True)
    no_cofepris = models.CharField(max_length=255, blank=True, null=True)
    fecha_pago_ip = models.DateField(blank=True, null=True)
    fecha_pago_comite = models.DateField(blank=True, null=True)
    fecha = models.DateField(blank=True, null=True)
    observaciones = models.TextField(blank=True, null=True)
    historial = models.TextField(blank=True, null=True)
    segmento_contable = models.CharField(max_length=255, blank=True, null=True)
    diseno = models.CharField(max_length=255, blank=True, null=True)
    tamano_muestras = models.CharField(max_length=255, blank=True, null=True)
    datos_adjuntos = models.FileField(upload_to='attachments/', blank=True, null=True)

class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField()

    def __str__(self):
        return f'{self.user.username} - {self.action} - {self.timestamp}'