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
    