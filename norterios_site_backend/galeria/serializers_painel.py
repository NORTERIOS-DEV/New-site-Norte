from rest_framework import serializers

from .models import Album, Categoria, Foto


class CategoriaPainelSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'slug']

    def validate_slug(self, value):
        if value:
            qs = Categoria.objects.filter(slug=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError('Já existe uma categoria com este slug.')
        return value


class FotoPainelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Foto
        fields = [
            'id', 'album', 'imagem', 'miniatura', 'imagem_media',
            'legenda', 'alt', 'largura', 'altura', 'ordem',
        ]
        read_only_fields = ['album', 'imagem', 'miniatura', 'imagem_media', 'largura', 'altura']


class AlbumPainelSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    total_fotos = serializers.IntegerField(source='fotos.count', read_only=True)
    fotos = FotoPainelSerializer(many=True, read_only=True)

    class Meta:
        model = Album
        fields = [
            'id', 'titulo', 'slug', 'descricao', 'data_evento', 'capa',
            'categoria', 'publicado', 'ordem', 'total_fotos', 'fotos',
            'data_criacao', 'data_atualizacao',
        ]
        read_only_fields = ['data_criacao', 'data_atualizacao']

    def validate_slug(self, value):
        if value:
            qs = Album.objects.filter(slug=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError('Já existe um álbum com este slug.')
        return value
