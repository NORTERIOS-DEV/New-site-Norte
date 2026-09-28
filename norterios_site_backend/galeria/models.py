from django.db import models
from django.utils.text import slugify


class Categoria(models.Model):
    nome = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=90, unique=True)

    class Meta:
        verbose_name_plural = 'Categorias'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class Album(models.Model):
    titulo = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    descricao = models.TextField(blank=True)
    data_evento = models.DateField(null=True, blank=True)
    capa = models.ImageField(upload_to='galeria/capas/%Y/%m/', blank=True, null=True)
    categoria = models.ForeignKey(
        Categoria,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='albuns',
    )
    publicado = models.BooleanField(default=False, db_index=True)
    ordem = models.PositiveIntegerField(default=0, db_index=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['ordem', '-data_evento', '-data_criacao']

    def __str__(self):
        return self.titulo

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.titulo)[:220]
            slug = base_slug
            suffix = 1
            while Album.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                suffix += 1
                slug = f'{base_slug}-{suffix}'[:220]
            self.slug = slug
        super().save(*args, **kwargs)


class Foto(models.Model):
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='fotos')
    imagem = models.ImageField(upload_to='galeria/originais/%Y/%m/')
    miniatura = models.ImageField(upload_to='galeria/miniaturas/%Y/%m/', blank=True, editable=False)
    imagem_media = models.ImageField(upload_to='galeria/medias/%Y/%m/', blank=True, editable=False)
    legenda = models.CharField(max_length=300, blank=True)
    alt = models.CharField(max_length=200, blank=True)
    largura = models.PositiveIntegerField(null=True, blank=True, editable=False)
    altura = models.PositiveIntegerField(null=True, blank=True, editable=False)
    ordem = models.PositiveIntegerField(default=0, db_index=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['ordem', 'id']

    def __str__(self):
        return self.legenda or f'Foto {self.pk} ({self.album.titulo})'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._imagem_original_name = self.imagem.name if self.pk else None

    def save(self, *args, **kwargs):
        from . import services

        imagem_mudou = self.imagem.name != self._imagem_original_name
        arquivos_antigos = None
        imagem_pil = None

        if imagem_mudou and self.imagem:
            if self.pk:
                arquivos_antigos = {
                    'imagem': self._imagem_original_name,
                    'miniatura': self.miniatura.name,
                    'imagem_media': self.imagem_media.name,
                }
            content, imagem_pil, largura, altura = services.process_new_image(self.imagem)
            self.imagem = content
            self.largura = largura
            self.altura = altura

        super().save(*args, **kwargs)

        if imagem_mudou and imagem_pil is not None:
            services.build_foto_variants(self, imagem_pil)
            Foto.objects.filter(pk=self.pk).update(
                miniatura=self.miniatura.name,
                imagem_media=self.imagem_media.name,
                largura=self.largura,
                altura=self.altura,
            )
            if arquivos_antigos:
                services.delete_arquivos(self.imagem.storage, arquivos_antigos.values())

        self._imagem_original_name = self.imagem.name
