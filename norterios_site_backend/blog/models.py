from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from .utils import estimate_reading_time


def _generate_unique_slug(model, titulo, pk, max_length):
    base_slug = slugify(titulo)[:max_length]
    slug = base_slug
    suffix = 1
    while model.objects.filter(slug=slug).exclude(pk=pk).exists():
        suffix += 1
        slug = f'{base_slug}-{suffix}'[:max_length]
    return slug


class Categoria(models.Model):
    nome = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=90, unique=True, blank=True)
    descricao = models.TextField(blank=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Categorias'
        ordering = ['nome']

    def __str__(self):
        return self.nome

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = _generate_unique_slug(Categoria, self.nome, self.pk, 90)
        super().save(*args, **kwargs)


class Autor(models.Model):
    nome = models.CharField(max_length=150)
    foto = models.ImageField(upload_to='blog/autores/%Y/%m/', blank=True, null=True)
    mini_bio = models.TextField('Mini biografia', blank=True)
    cargo = models.CharField(max_length=120, blank=True)
    ativo = models.BooleanField(default=True)

    class Meta:
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
    conteudo = models.TextField(
        blank=True,
        help_text='Conteúdo legado em HTML. Preenchido apenas em posts criados antes do editor TipTap.',
    )
    conteudo_json = models.JSONField(
        null=True,
        blank=True,
        help_text='Conteúdo estruturado do editor TipTap (fonte da verdade para posts novos/editados no painel).',
    )
    imagem_capa = models.ImageField(upload_to='blog/capas/%Y/%m/', blank=True, null=True)
    autor = models.ForeignKey(
        Autor,
        on_delete=models.PROTECT,
        related_name='posts',
    )
    tempo_leitura_minutos = models.PositiveIntegerField(null=True, blank=True)
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
        max_length=20, choices=STATUS_CHOICES, default=STATUS_RASCUNHO, db_index=True,
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
            self.slug = _generate_unique_slug(Post, self.titulo, self.pk, 220)
        if self.status == self.STATUS_PUBLICADO and not self.data_publicacao:
            self.data_publicacao = timezone.now()
        if not self.tempo_leitura_minutos and self.conteudo_json:
            self.tempo_leitura_minutos = estimate_reading_time(self.conteudo_json)
        super().save(*args, **kwargs)
