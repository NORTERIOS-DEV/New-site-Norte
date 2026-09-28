from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import MeView

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='painel-token-obtain'),
    path('login/refresh/', TokenRefreshView.as_view(), name='painel-token-refresh'),
    path('me/', MeView.as_view(), name='painel-me'),
]
