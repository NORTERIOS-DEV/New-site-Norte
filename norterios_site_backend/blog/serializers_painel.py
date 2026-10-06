import json

from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers

from .models import Autor, Categoria, Post
from .validators import contem_imagem_sem_alt, validate_tiptap_document


class FlexibleJSONField(serializers.JSONField):
    """JSONField que aceita tanto um objeto já decodificado (requisição
    application/json) quanto uma string JSON (requisição multipart/form-data,
    necessária quando o formulário também envia imagem_capa) - o JSONField
    padrão do DRF só decodifica string quando binary=True, e nesse modo ele
    quebra a entrada normal em JSON puro."""

    def to_internal_value(self, data):
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except (TypeError, ValueError):
                self.fail('invalid')
        return super().to_internal_value(data)


class AutorPainelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Autor
        fields = [
            'id', 'nome', 'nome_exibicao', 'foto', 'mini_bio', 'cargo',
            'formacao_especialidade', 'instagram', 'linkedin', 'ativo',
        ]


class CategoriaPainelSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'slug', 'descricao', 'ativo']

    def validate_slug(self, value):
        if value:
            qs = Categoria.objects.filter(slug=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError('Já existe uma categoria com este slug.')
        return value


class PostPainelSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    autor = serializers.PrimaryKeyRelatedField(queryset=Autor.objects.filter(ativo=True), required=False)
    autor_nome = serializers.CharField(source='autor.nome', read_only=True)
    categoria = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.filter(ativo=True), allow_null=True, required=False,
    )
    categoria_nome = serializers.SerializerMethodField()
    # "agendado" não existe em Post.STATUS_CHOICES (ver models.py) - é
    # traduzido para `publicado` em validate() e o estado é recuperado via
    # `status_efetivo` (derivado de status + data_publicacao futura).
    status = serializers.ChoiceField(choices=list(Post.STATUS_LABELS.items()))
    status_display = serializers.SerializerMethodField()
    status_efetivo = serializers.CharField(read_only=True)
    conteudo_json = FlexibleJSONField(required=False, allow_null=True)

    class Meta:
        model = Post
        fields = [
            'id', 'titulo', 'slug', 'resumo', 'conteudo', 'conteudo_json',
            'imagem_capa', 'autor', 'autor_nome', 'categoria', 'categoria_nome',
            'destaque', 'status', 'status_display', 'status_efetivo', 'tempo_leitura_minutos',
            'data_criacao', 'data_atualizacao', 'data_publicacao',
            'meta_title', 'meta_description', 'og_image',
        ]
        # `conteudo` (HTML legado) é só leitura no painel - serve apenas para o
        # frontend detectar posts antigos que ainda não passaram pelo editor
        # novo e converter para JSON no cliente; a escrita é sempre via
        # conteudo_json daqui pra frente.
        read_only_fields = ['data_criacao', 'data_atualizacao', 'conteudo']

    def get_categoria_nome(self, obj):
        return obj.categoria.nome if obj.categoria_id else None

    def get_status_display(self, obj):
        return Post.STATUS_LABELS.get(obj.status_efetivo, obj.status_efetivo)

    def validate_slug(self, value):
        if value:
            qs = Post.objects.filter(slug=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError('Já existe uma postagem com este slug.')
        return value

    def validate_conteudo_json(self, value):
        try:
            validate_tiptap_document(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message)
        return value

    def validate(self, attrs):
        from accounts.models import perfil_usuario
        perfil = perfil_usuario(self.context['request'].user)
        if perfil.tipo == 'autor':
            if 'autor' in attrs and attrs['autor'].pk != perfil.autor_id:
                raise serializers.ValidationError({'autor': 'Você só pode usar sua própria autoria.'})
            if 'destaque' in self.initial_data:
                raise serializers.ValidationError({'destaque': 'Somente gerentes podem definir destaque.'})
            attrs.pop('destaque', None)
            attrs['autor'] = perfil.autor
        elif not self.instance and 'autor' not in attrs:
            raise serializers.ValidationError({'autor': 'Informe o autor.'})
        status_in = attrs.get('status')

        if status_in == Post.STATUS_AGENDADO:
            data_pub = attrs.get('data_publicacao', getattr(self.instance, 'data_publicacao', None))
            if not data_pub or data_pub <= timezone.now():
                raise serializers.ValidationError(
                    {'data_publicacao': ['Informe uma data futura para agendar a publicação.']},
                )
            attrs['status'] = Post.STATUS_PUBLICADO
            status_in = Post.STATUS_PUBLICADO

        if status_in == Post.STATUS_PUBLICADO:
            imagem = attrs.get('imagem_capa', getattr(self.instance, 'imagem_capa', None))
            if not imagem:
                raise serializers.ValidationError({'imagem_capa': ['Obrigatória para publicar.']})

            conteudo = attrs.get('conteudo_json', getattr(self.instance, 'conteudo_json', None))
            if contem_imagem_sem_alt(conteudo):
                raise serializers.ValidationError(
                    {'conteudo_json': ['Todas as imagens do conteúdo precisam de texto alternativo antes de publicar.']},
                )

        return attrs
