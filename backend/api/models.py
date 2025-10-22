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
    full_name = models.CharField(max_length=255, blank=True, default='')
    
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

class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField()

    def __str__(self):
        return f'{self.user.username} - {self.action} - {self.timestamp}'
# models.py
# ... (otros imports y modelos)

class RequisicionItem(models.Model):
    requisicion = models.ForeignKey('Requisicion', related_name='items', on_delete=models.CASCADE)
    partida_num = models.PositiveIntegerField()
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    unidad = models.CharField(max_length=50)
    producto = models.TextField()

    class Meta:
        ordering = ['partida_num'] # Ordena los ítems por número de partida

    def __str__(self):
        return f"Item {self.partida_num} para Requisición {self.requisicion.id}"

class Requisicion(models.Model):
    TIPO_CHOICES = [
        ('Material', 'Material'),
        ('Equipo/Instrumento', 'Equipo/Instrumento'),
        ('Servicio', 'Servicio'),
    ]

    folio = models.CharField(max_length=100, unique=True, blank=True) # El folio podría generarse automáticamente
    fecha_solicitud = models.DateField()
    tipo_requisicion = models.CharField(max_length=50, choices=TIPO_CHOICES)
    justificacion = models.TextField()
    nombre_solicitante = models.CharField(max_length=255)
    fecha_firma_solicitante = models.DateField(null=True, blank=True)
    nombre_autoriza = models.CharField(max_length=255, null=True, blank=True)
    fecha_firma_autoriza = models.DateField(null=True, blank=True)
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='requisiciones_creadas')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    # Puedes añadir campos de estado, etc.

    def save(self, *args, **kwargs):
        if not self.folio:
            # Generación simple de folio (ej: REQ-YYYYMMDD-ID) - Mejora según necesidad
            today_str = self.fecha_solicitud.strftime('%Y%m%d')
            last_req = Requisicion.objects.filter(folio__startswith=f"REQ-{today_str}-").order_by('-folio').first()
            if last_req:
                last_id = int(last_req.folio.split('-')[-1])
                new_id = last_id + 1
            else:
                new_id = 1
            self.folio = f"REQ-{today_str}-{new_id:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.folio