from django.contrib import admin
from django.urls import path, include
from users.views import CreateUserView, MyTokenObtainPairView 
from rest_framework_simplejwt.views import TokenRefreshView 

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", MyTokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")), 
    path("api/users/", include("users.urls")), 
    path("api/unebi/", include("unebi.urls")), 
    path("api/requisitions/", include("requisitions.urls")), 
    path("api/auditing/", include("auditing.urls")), 
]