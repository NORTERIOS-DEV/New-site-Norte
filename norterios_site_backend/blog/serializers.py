from rest_framework import serializers

from .models import Categoria, Post


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'slug']


class PostListSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    autor_nome = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'titulo', 'slug', 'resumo', 'imagem_capa', 'autor_nome',
            'categoria', 'data_publicacao', 'destaque', 'tempo_leitura_minutos',
        ]

    def get_autor_nome(self, obj):
        return obj.autor.nome_publico


class PostDetailSerializer(PostListSerializer):
    meta_title = serializers.SerializerMethodField()
    meta_description = serializers.SerializerMethodField()
    og_image = serializers.SerializerMethodField()

    class Meta(PostListSerializer.Meta):
        fields = PostListSerializer.Meta.fields + [
            'conteudo', 'conteudo_json', 'meta_title', 'meta_description', 'og_image',
        ]

    def get_meta_title(self, obj):
        return obj.meta_title_efetivo

    def get_meta_description(self, obj):
        return obj.meta_description_efetivo

    def get_og_image(self, obj):
        imagem = obj.og_image_efetivo
        if not imagem:
            return None
        request = self.context.get('request')
        url = imagem.url
        return request.build_absolute_uri(url) if request else url
