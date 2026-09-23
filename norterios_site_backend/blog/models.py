from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from django_ckeditor_5.fields import CKEditor5Field


class Categoria(models.Model):
    nome = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=90, unique=True)

    class Meta:
        verbose_name_plural = 'Categorias'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class Post(models.Model):
    STATUS_RASCUNHO = 'rascunho'
    STATUS_PUBLICADO = 'publicado'
    STATUS_CHOICES = [
        (STATUS_RASCUNHO, 'Rascunho'),
        (STATUS_PUBLICADO, 'Publicado'),
    ]

    titulo = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    resumo = models.CharField(max_length=300)
    conteudo = CKEditor5Field(config_name='default')
    imagem_capa = models.ImageField(upload_to='blog/capas/%Y/%m/', blank=True, null=True)
    autor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='posts',
    )
    categoria = models.ForeignKey(
        Categoria,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='posts',
    )
    destaque = models.BooleanField(
        'Destaque na home',
        default=False,
        db_index=True,
        help_text='Exibe este post na seção de destaques da página inicial.',
    )
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default=STATUS_RASCUNHO, db_index=True,
    )
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)
    data_publicacao = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-data_publicacao', '-data_criacao']

    def __str__(self):
        return self.titulo

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.titulo)[:220]
            slug = base_slug
            suffix = 1
            while Post.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                suffix += 1
                slug = f'{base_slug}-{suffix}'[:220]
            self.slug = slug
        if self.status == self.STATUS_PUBLICADO and not self.data_publicacao:
            self.data_publicacao = timezone.now()
        super().save(*args, **kwargs)
