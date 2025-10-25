from django.db import models
from django.contrib.auth.models import User

class RequisicionItem(models.Model):
    requisicion = models.ForeignKey('Requisicion', related_name='items', on_delete=models.CASCADE)
    partida_num = models.PositiveIntegerField()
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    unidad = models.CharField(max_length=50)
    producto = models.TextField()

    class Meta:
        ordering = ['partida_num']

    def __str__(self):
        return f"Item {self.partida_num} para Requisición {self.requisicion.id}"

class Requisicion(models.Model):
    TIPO_CHOICES = [
        ('Material', 'Material'),
        ('Equipo/Instrumento', 'Equipo/Instrumento'),
        ('Servicio', 'Servicio'),
    ]

    folio = models.CharField(max_length=100, unique=True, blank=True)
    fecha_solicitud = models.DateField()
    tipo_requisicion = models.CharField(max_length=50, choices=TIPO_CHOICES)
    justificacion = models.TextField()
    nombre_solicitante = models.CharField(max_length=255)
    fecha_firma_solicitante = models.DateField(null=True, blank=True)
    nombre_autoriza = models.CharField(max_length=255, null=True, blank=True)
    fecha_firma_autoriza = models.DateField(null=True, blank=True)
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='requisiciones_creadas')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.folio:
            # Generación simple de folio (ej: REQ-YYYYMMDD-ID)
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