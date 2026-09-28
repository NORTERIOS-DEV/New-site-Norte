from django.urls import path

from .views import ImageUploadView

urlpatterns = [
    path('imagem/', ImageUploadView.as_view(), name='painel-upload-imagem'),
]
