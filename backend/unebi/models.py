from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

class UnebiKey(models.Model):
    elaborador = models.CharField(max_length=255, blank=True, null=True)
    tipo_estudio = models.CharField(max_length=255, blank=True, null=True)
    patrocinador = models.CharField(max_length=255, blank=True, null=True)
    principio_activo = models.TextField(blank=True, null=True)
    condicion = models.CharField(max_length=255, blank=True, null=True)
    orden_servicio = models.CharField(max_length=255, blank=True, null=True)
    fecha_solicitud = models.DateField(blank=True, null=True)
    fecha_cofepris = models.DateField(blank=True, null=True)
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