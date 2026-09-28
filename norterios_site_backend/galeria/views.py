from django.db.models import Count
from rest_framework import filters
from rest_framework.decorators import action
from rest_framework.viewsets import ReadOnlyModelViewSet

from .models import Album, Categoria
from .serializers import (
    AlbumDetailSerializer,
    AlbumListSerializer,
    CategoriaSerializer,
    FotoSerializer,
)


class AlbumViewSet(ReadOnlyModelViewSet):
    lookup_field = 'slug'
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['data_evento']

    def get_queryset(self):
        # annotate() with an aggregate silently drops the model's default
        # ordering, so it must be reasserted explicitly for stable pagination.
        queryset = (
            Album.objects.filter(publicado=True)
            .select_related('categoria')
            .annotate(total_fotos=Count('fotos'))
            .order_by(*Album._meta.ordering)
        )
        categoria_slug = self.request.query_params.get('categoria')
        if categoria_slug:
            queryset = queryset.filter(categoria__slug=categoria_slug)
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AlbumDetailSerializer
        return AlbumListSerializer

    @action(detail=True, methods=['get'])
    def fotos(self, request, slug=None):
        album = self.get_object()
        page = self.paginate_queryset(album.fotos.all())
        serializer = FotoSerializer(page, many=True, context=self.get_serializer_context())
        return self.get_paginated_response(serializer.data)


class CategoriaViewSet(ReadOnlyModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    pagination_class = None
