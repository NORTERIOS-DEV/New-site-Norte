from django.db import IntegrityError
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from accounts.viewsets import PainelModelViewSet

from .models import Autor, Categoria, Post
from .serializers_painel import AutorPainelSerializer, CategoriaPainelSerializer, PostPainelSerializer

ORDENACOES_PERMITIDAS = {
    'data_atualizacao', '-data_atualizacao',
    'data_publicacao', '-data_publicacao',
    'data_criacao', '-data_criacao',
    'titulo', '-titulo',
}


class PostPainelViewSet(PainelModelViewSet):
    serializer_class = PostPainelSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            raise ValidationError({'slug': ['Já existe uma postagem com este slug.']})

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except IntegrityError:
            raise ValidationError({'slug': ['Já existe uma postagem com este slug.']})

    def get_queryset(self):
        queryset = Post.objects.select_related('autor', 'categoria').all()
        params = self.request.query_params

        titulo = params.get('titulo')
        if titulo:
            queryset = queryset.filter(titulo__icontains=titulo)

        categoria = params.get('categoria')
        if categoria:
            queryset = queryset.filter(categoria_id=categoria)

        autor = params.get('autor')
        if autor:
            queryset = queryset.filter(autor_id=autor)

        status_param = params.get('status')
        if status_param == Post.STATUS_AGENDADO:
            queryset = queryset.filter(status=Post.STATUS_PUBLICADO, data_publicacao__gt=timezone.now())
        elif status_param == Post.STATUS_PUBLICADO:
            queryset = queryset.filter(status=Post.STATUS_PUBLICADO).exclude(data_publicacao__gt=timezone.now())
        elif status_param:
            queryset = queryset.filter(status=status_param)

        data_de = params.get('data_de')
        if data_de:
            queryset = queryset.filter(data_publicacao__date__gte=data_de)

        data_ate = params.get('data_ate')
        if data_ate:
            queryset = queryset.filter(data_publicacao__date__lte=data_ate)

        ordering = params.get('ordering')
        if ordering not in ORDENACOES_PERMITIDAS:
            ordering = '-data_atualizacao'
        return queryset.order_by(ordering)

    @action(detail=True, methods=['post'])
    def publicar(self, request, pk=None):
        post = self.get_object()
        serializer = self.get_serializer(post, data={'status': Post.STATUS_PUBLICADO}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def despublicar(self, request, pk=None):
        post = self.get_object()
        serializer = self.get_serializer(post, data={'status': Post.STATUS_RASCUNHO}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CategoriaPainelViewSet(PainelModelViewSet):
    # Sem paginação: lista pequena, usada também como fonte dos selects de
    # categoria no formulário de post (que precisa de todas, não só 10).
    queryset = Categoria.objects.all()
    serializer_class = CategoriaPainelSerializer
    pagination_class = None


class AutorPainelViewSet(PainelModelViewSet):
    # Idem: lista pequena, usada também no select de autor do formulário de post.
    queryset = Autor.objects.all()
    serializer_class = AutorPainelSerializer
    pagination_class = None

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.posts.exists():
            return Response(
                {'detail': 'Não é possível excluir um autor com postagens associadas. Desative-o em vez disso.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)
