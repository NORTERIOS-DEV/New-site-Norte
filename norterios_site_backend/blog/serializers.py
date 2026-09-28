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
        return obj.autor.nome


class PostDetailSerializer(PostListSerializer):
    class Meta(PostListSerializer.Meta):
        fields = PostListSerializer.Meta.fields + ['conteudo', 'conteudo_json']
