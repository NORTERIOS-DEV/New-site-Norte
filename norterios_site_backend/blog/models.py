from django.core.exceptions import ValidationError
from django.db import connections, models, router, transaction
from django.utils import timezone
from django.utils.text import slugify

from uploads.validators import validate_image_extension, validate_image_size

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
    nome_exibicao = models.CharField(
        'Nome de exibição',
        max_length=150,
        blank=True,
        help_text='Nome público exibido nos posts do site. Se vazio, usa o campo Nome.',
    )
    foto = models.ImageField(upload_to='blog/autores/%Y/%m/', blank=True, null=True)
    mini_bio = models.TextField('Mini biografia', blank=True)
    cargo = models.CharField(max_length=120, blank=True)
    formacao_especialidade = models.CharField('Formação / especialidade', max_length=150, blank=True)
    instagram = models.URLField('Instagram', blank=True)
    linkedin = models.URLField('LinkedIn', blank=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        ordering = ['nome']

    def __str__(self):
        return self.nome

    @property
    def nome_publico(self):
        """Nome usado como autoria visível no site público: nome_exibicao,
        com fallback para nome quando vazio."""
        return self.nome_exibicao or self.nome


class Post(models.Model):
    STATUS_RASCUNHO = 'rascunho'
    STATUS_PUBLICADO = 'publicado'
    STATUS_AGENDADO = 'agendado'
    STATUS_CHOICES = [
        (STATUS_RASCUNHO, 'Rascunho'),
        (STATUS_PUBLICADO, 'Publicado'),
    ]
    # "agendado" não é um valor persistido em `status` (ver `status_efetivo`) -
    # existe aqui só para alimentar os rótulos exibidos no painel.
    STATUS_LABELS = dict(STATUS_CHOICES) | {STATUS_AGENDADO: 'Agendado'}

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
    imagem_capa = models.ImageField(
        upload_to='blog/capas/%Y/%m/',
        blank=True,
        null=True,
        validators=[validate_image_extension, validate_image_size],
    )
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
    meta_title = models.CharField(
        'Meta title (SEO)', max_length=70, blank=True,
        help_text='Se vazio, usa o título do post.',
    )
    meta_description = models.CharField(
        'Meta description (SEO)', max_length=160, blank=True,
        help_text='Se vazio, usa o resumo do post.',
    )
    og_image = models.ImageField(
        'Imagem para compartilhamento (Open Graph)',
        upload_to='blog/og/%Y/%m/',
        blank=True,
        null=True,
        validators=[validate_image_extension, validate_image_size],
        help_text='Se vazia, usa a imagem de capa.',
    )

    class Meta:
        ordering = ['-data_publicacao', '-data_criacao']

    def __str__(self):
        return self.titulo

    @property
    def status_efetivo(self):
        """Estado exibido ao usuário: "agendado" é derivado (status=publicado
        com data_publicacao futura), nunca persistido no banco - ver
        PostPainelSerializer.validate()."""
        if self.status == self.STATUS_PUBLICADO and self.data_publicacao and self.data_publicacao > timezone.now():
            return self.STATUS_AGENDADO
        return self.status

    @property
    def meta_title_efetivo(self):
        return self.meta_title or self.titulo

    @property
    def meta_description_efetivo(self):
        return self.meta_description or self.resumo

    @property
    def og_image_efetivo(self):
        return self.og_image or self.imagem_capa

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = _generate_unique_slug(Post, self.titulo, self.pk, 220)
        if self.status == self.STATUS_PUBLICADO and not self.data_publicacao:
            self.data_publicacao = timezone.now()
        if not self.tempo_leitura_minutos and self.conteudo_json:
            self.tempo_leitura_minutos = estimate_reading_time(self.conteudo_json)

        using = kwargs.get('using') or router.db_for_write(Post, instance=self)
        with transaction.atomic(using=using):
            if self.destaque:
                # Serializa a contagem e a gravacao entre requisicoes no PostgreSQL.
                connection = connections[using]
                if connection.vendor == 'postgresql':
                    with connection.cursor() as cursor:
                        cursor.execute('SELECT pg_advisory_xact_lock(%s)', [730031])
                self.validar_limite_destaques(using)
            super().save(*args, **kwargs)

    def validar_limite_destaques(self, using=None):
        if self.destaque and Post.objects.using(using).filter(destaque=True).exclude(pk=self.pk).count() >= 3:
            raise ValidationError({'destaque': 'No máximo 3 posts podem ficar em destaque. Desmarque um antes de adicionar outro.'})

    def clean(self):
        super().clean()
        self.validar_limite_destaques()
