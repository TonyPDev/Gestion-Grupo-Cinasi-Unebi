from django.shortcuts import render
from rest_framework import generics
from .serializers import ActivityLogSerializer
from rest_framework.permissions import IsAuthenticated
from users.permissions import *
from .models import ActivityLog

# Create your views here.
class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        queryset = ActivityLog.objects.all().order_by('-timestamp')
        action_type = self.request.query_params.get('action', None)
        if action_type is not None:
            queryset = queryset.filter(action=action_type)
        return queryset