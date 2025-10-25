from django.contrib import admin
from .models import ActivityLog

# Register your models here.
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'timestamp', 'details')
    list_filter = ('action', 'user') 
    search_fields = ('user__username', 'details') 

admin.site.register(ActivityLog, ActivityLogAdmin) 