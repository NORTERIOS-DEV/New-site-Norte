from rest_framework import serializers

from .models import Album, Categoria, Foto


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'slug']


class FotoSerializer(serializers.ModelSerializer):
    alt = serializers.SerializerMethodField()

    class Meta:
        model = Foto
        fields = [
            'id', 'imagem', 'miniatura', 'imagem_media',
            'legenda', 'alt', 'largura', 'altura', 'ordem',
        ]

    def get_alt(self, obj):
        return obj.alt or obj.legenda or obj.album.titulo


class AlbumListSerializer(serializers.ModelSerializer):
    capa = serializers.SerializerMethodField()
    categoria = CategoriaSerializer(read_only=True)
    total_fotos = serializers.IntegerField(read_only=True)

    class Meta:
        model = Album
        fields = ['id', 'titulo', 'slug', 'data_evento', 'capa', 'categoria', 'total_fotos']

    def get_capa(self, obj):
        request = self.context.get('request')
        if obj.capa:
            url = obj.capa.url
        else:
            primeira = obj.fotos.order_by('ordem', 'id').first()
            url = primeira.miniatura.url if primeira and primeira.miniatura else None
        if url and request:
            return request.build_absolute_uri(url)
        return url


class AlbumDetailSerializer(AlbumListSerializer):
    class Meta(AlbumListSerializer.Meta):
        fields = AlbumListSerializer.Meta.fields + ['descricao']
