from django.urls import path

from .views import MeView, MePasswordView, MeAutorView, LoginView, RefreshView

urlpatterns = [
    path('login/', LoginView.as_view(), name='painel-token-obtain'),
    path('login/refresh/', RefreshView.as_view(), name='painel-token-refresh'),
    path('me/', MeView.as_view(), name='painel-me'),
    path('me/senha/', MePasswordView.as_view()),
    path('me/autor/', MeAutorView.as_view()),
]
