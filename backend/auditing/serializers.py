from rest_framework import serializers
from .models import ActivityLog

class ActivityLogSerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source='user.profile.full_name', read_only=True, default='')
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'user_username', 'user_full_name', 'action', 'details', 'timestamp']