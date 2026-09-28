import json

from rest_framework import serializers

from .models import Autor, Categoria, Post


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
        fields = ['id', 'nome', 'foto', 'mini_bio', 'cargo', 'ativo']


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
    autor = serializers.PrimaryKeyRelatedField(queryset=Autor.objects.filter(ativo=True))
    autor_nome = serializers.CharField(source='autor.nome', read_only=True)
    categoria = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.filter(ativo=True), allow_null=True, required=False,
    )
    categoria_nome = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    conteudo_json = FlexibleJSONField(required=False, allow_null=True)

    class Meta:
        model = Post
        fields = [
            'id', 'titulo', 'slug', 'resumo', 'conteudo', 'conteudo_json',
            'imagem_capa', 'autor', 'autor_nome', 'categoria', 'categoria_nome',
            'destaque', 'status', 'status_display', 'tempo_leitura_minutos',
            'data_criacao', 'data_atualizacao', 'data_publicacao',
        ]
        # `conteudo` (HTML legado) é só leitura no painel - serve apenas para o
        # frontend detectar posts antigos que ainda não passaram pelo editor
        # novo e converter para JSON no cliente; a escrita é sempre via
        # conteudo_json daqui pra frente.
        read_only_fields = ['data_criacao', 'data_atualizacao', 'conteudo']

    def get_categoria_nome(self, obj):
        return obj.categoria.nome if obj.categoria_id else None

    def validate_slug(self, value):
        if value:
            qs = Post.objects.filter(slug=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError('Já existe uma postagem com este slug.')
        return value
