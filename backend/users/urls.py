from django.urls import path
from . import views

urlpatterns = [
    path("me/", views.CurrentUserView.as_view(), name="current-user"),
    path("", views.UserListView.as_view(), name="user-list"),
    path("<int:pk>/", views.UserDetailView.as_view(), name="user-detail"),
    path("delete/<int:pk>/", views.UserDeleteView.as_view(), name="user-delete"),
]