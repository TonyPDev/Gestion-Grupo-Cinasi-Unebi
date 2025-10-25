from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone # Necesario para la lógica de save
import datetime # Necesario para la lógica de save

from users.models import Profile

class RequisicionItem(models.Model):
    requisicion = models.ForeignKey('Requisicion', related_name='items', on_delete=models.CASCADE)
    partida_num = models.PositiveIntegerField()
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    unidad = models.CharField(max_length=50)
    producto = models.TextField()

    class Meta:
        ordering = ['partida_num']

    def __str__(self):
        return f"Item {self.partida_num} para Requisición {self.requisicion.folio if hasattr(self.requisicion, 'folio') else self.requisicion.id}"


class Requisicion(models.Model):
    TIPO_CHOICES = [
        ('Material', 'Material'),
        ('Equipo/Instrumento', 'Equipo/Instrumento'),
        ('Servicio', 'Servicio'),
    ]

    STATUS_CHOICES = [
        ('DRAFT', 'Borrador'),
        ('PENDING_MANAGER', 'Pendiente Aprobación Jefe'),
        ('PENDING_PURCHASING', 'Pendiente Aprobación Compras'),
        ('APPROVED', 'Aprobada'),
        ('REJECTED', 'Rechazada'),
    ]

    folio = models.CharField(max_length=100, unique=True, blank=True)
    fecha_solicitud = models.DateField()
    tipo_requisicion = models.CharField(max_length=50, choices=TIPO_CHOICES)
    justificacion = models.TextField()

    nombre_solicitante = models.CharField(max_length=255)

    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='requisiciones_creadas')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING_MANAGER')
    approver_assigned = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='requisitions_to_approve')
    approved_by_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='requisitions_manager_approved')
    manager_approval_date = models.DateTimeField(null=True, blank=True)
    approved_by_purchasing = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='requisitions_purchasing_approved')
    purchasing_approval_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)


    def save(self, *args, **kwargs):
        is_new = self._state.adding # Verifica si es una instancia nueva

        # Generación de Folio
        if not self.folio:
            fecha = self.fecha_solicitud or datetime.date.today()
            today_str = fecha.strftime('%Y%m%d')
            # Ajuste en la consulta para evitar errores si no hay requisiciones hoy
            last_req = Requisicion.objects.filter(folio__startswith=f"REQ-{today_str}-").order_by('-folio').first()

            new_id = 1
            if last_req:
                try:
                    # Intenta extraer el número secuencial
                    last_id_str = last_req.folio.split('-')[-1]
                    if last_id_str.isdigit():
                        new_id = int(last_id_str) + 1
                except (IndexError, ValueError):
                    # Si el formato del último folio no es el esperado, empieza en 1
                    new_id = 1 # O maneja el error como prefieras

            self.folio = f"REQ-{today_str}-{new_id:03d}"

        # Lógica para asignar el approver inicial al crear
        if is_new and not self.approver_assigned and self.creado_por:
            try:
                # Intenta obtener el manager del perfil del creador
                profile = Profile.objects.get(user=self.creado_por)
                if profile.manager:
                    self.approver_assigned = profile.manager
                    self.status = 'PENDING_MANAGER'
                else:
                    # Si no tiene manager, ¿qué hacer?
                    # Opción: Poner en Borrador o asignar a Compras directo?
                    # Por ahora, la dejamos PENDING_MANAGER sin asignado (necesitará lógica extra)
                    print(f"Advertencia: Usuario {self.creado_por.username} no tiene manager asignado para la requisición {self.folio}.")
                    self.approver_assigned = None
                    # Podrías cambiar el estado si prefieres:
                    # self.status = 'DRAFT' # O un estado 'NEEDS_MANAGER_ASSIGNMENT'
            except Profile.DoesNotExist:
                 print(f"Advertencia: Usuario {self.creado_por.username} no tiene perfil. No se pudo asignar manager para {self.folio}.")
                 self.approver_assigned = None
                 # self.status = 'DRAFT' # Considera cambiar el estado inicial

        super().save(*args, **kwargs) # Llama al método save original

    def __str__(self):
        # Usamos getattr para evitar errores si status no está definido aún
        status_display = getattr(self, 'get_status_display', lambda: self.status)()
        return f"{self.folio} ({status_display})"