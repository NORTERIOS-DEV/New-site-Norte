from django.utils import timezone
from rest_framework import filters
from rest_framework.viewsets import ReadOnlyModelViewSet

from .models import Categoria, Post
from .serializers import CategoriaSerializer, PostDetailSerializer, PostListSerializer


class PostViewSet(ReadOnlyModelViewSet):
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titulo', 'resumo']
    ordering_fields = ['data_publicacao']

    def get_queryset(self):
        queryset = (
            Post.objects
            .filter(status=Post.STATUS_PUBLICADO, data_publicacao__lte=timezone.now())
            .select_related('categoria', 'autor')
        )
        categoria_slug = self.request.query_params.get('categoria')
        if categoria_slug:
            queryset = queryset.filter(categoria__slug=categoria_slug)
        destaque = self.request.query_params.get('destaque')
        if destaque and destaque.lower() in ('1', 'true'):
            queryset = queryset.filter(destaque=True)
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostListSerializer


class CategoriaViewSet(ReadOnlyModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    pagination_class = None
