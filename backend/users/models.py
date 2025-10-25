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
    
    nombre = models.CharField(max_length=150, blank=True, default='')
    apellido_paterno = models.CharField(max_length=150, blank=True, default='')
    apellido_materno = models.CharField(max_length=150, blank=True, default='')

    full_name = models.CharField(max_length=255, blank=True, default='')
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordinates' 
    )

    def save(self, *args, **kwargs):
        nombres = [self.nombre, self.apellido_paterno, self.apellido_materno]
        self.full_name = ' '.join(filter(None, nombres)).strip()
        super().save(*args, **kwargs)

    def __str__(self):
        manager_username = self.manager.username if self.manager else 'N/A'
        roles_str = ', '.join([role.name for role in self.roles.all()]) if self.pk else 'No Roles Yet'
        return f"{self.user.username} - Roles: {roles_str} - Manager: {manager_username}"
