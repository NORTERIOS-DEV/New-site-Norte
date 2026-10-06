from django.conf import settings
from django.db import models


class Perfil(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='perfil')
    nome_completo = models.CharField(max_length=150, blank=True)
    telefone = models.CharField(max_length=30, blank=True)
    cargo = models.CharField(max_length=120, blank=True)
    tipo = models.CharField(max_length=10, choices=[('gerente', 'Gerente'), ('autor', 'Autor'), ('comum', 'Usuário comum')], default='comum')
    versao_sessao = models.PositiveIntegerField(default=1)
    autor = models.OneToOneField('blog.Autor', null=True, blank=True, on_delete=models.SET_NULL, related_name='perfil_conta')


def perfil_usuario(user):
    perfil, _ = Perfil.objects.get_or_create(user=user, defaults={
        'nome_completo': user.get_full_name(),
        'tipo': 'gerente' if user.is_superuser or user.groups.filter(name='Gerenciador').exists() else 'comum',
    })
    return perfil
