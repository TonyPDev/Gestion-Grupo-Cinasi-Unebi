from django.contrib import admin
from .models import Profile, Role, UnebiKey, ActivityLog

class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'timestamp', 'details')
    list_filter = ('action', 'user') 
    search_fields = ('user__username', 'details') 
admin.site.register(Profile)
admin.site.register(Role)
admin.site.register(UnebiKey)
admin.site.register(ActivityLog, ActivityLogAdmin) 