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
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordinates' 
    )

    def __str__(self):
        manager_username = self.manager.username if self.manager else 'N/A'
        roles_str = ', '.join([role.name for role in self.roles.all()]) if self.pk else 'No Roles Yet'
        return f"{self.user.username} - Roles: {roles_str} - Manager: {manager_username}"