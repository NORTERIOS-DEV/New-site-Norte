from django.db import transaction
from django.db.models import Max
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.mixins import DestroyModelMixin, UpdateModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework_simplejwt.authentication import JWTAuthentication

from accounts.permissions import DjangoModelPermissionsWithView
from accounts.viewsets import PainelModelViewSet

from .models import Album, Categoria, Foto
from .serializers_painel import AlbumPainelSerializer, CategoriaPainelSerializer, FotoPainelSerializer


class AlbumPainelViewSet(PainelModelViewSet):
    queryset = Album.objects.select_related('categoria').prefetch_related('fotos').all()
    serializer_class = AlbumPainelSerializer

    @action(detail=True, methods=['post'])
    def publicar(self, request, pk=None):
        album = self.get_object()
        album.publicado = True
        album.save()
        return Response(self.get_serializer(album).data)

    @action(detail=True, methods=['post'])
    def despublicar(self, request, pk=None):
        album = self.get_object()
        album.publicado = False
        album.save()
        return Response(self.get_serializer(album).data)

    @action(detail=True, methods=['post'], url_path='fotos/upload')
    def upload_fotos(self, request, pk=None):
        """Réplica de galeria/admin.py:AlbumAdmin.upload_fotos_view para a API
        autenticada - a validação/redimensionamento acontece toda em
        Foto.save(), então só falta criar um registro por arquivo enviado."""
        album = self.get_object()
        arquivos = request.FILES.getlist('fotos')
        if not arquivos:
            return Response({'detail': 'Nenhum arquivo enviado.'}, status=status.HTTP_400_BAD_REQUEST)

        proxima_ordem = (album.fotos.aggregate(Max('ordem'))['ordem__max'] or 0) + 1
        criadas = []
        erros = []
        for indice, arquivo in enumerate(arquivos):
            try:
                foto = Foto.objects.create(album=album, imagem=arquivo, ordem=proxima_ordem + indice)
                criadas.append(FotoPainelSerializer(foto, context=self.get_serializer_context()).data)
            except Exception as exc:
                erros.append({'arquivo': arquivo.name, 'erro': str(exc)})

        return Response({'criadas': criadas, 'erros': erros}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='fotos/reordenar')
    def reordenar_fotos(self, request, pk=None):
        album = self.get_object()
        ordem_ids = request.data.get('ordem')
        if not isinstance(ordem_ids, list):
            return Response(
                {'detail': "Envie 'ordem' como uma lista de IDs das fotos na nova ordem."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            for indice, foto_id in enumerate(ordem_ids):
                Foto.objects.filter(pk=foto_id, album=album).update(ordem=indice)

        fotos = album.fotos.all()
        return Response(FotoPainelSerializer(fotos, many=True, context=self.get_serializer_context()).data)


class FotoPainelViewSet(UpdateModelMixin, DestroyModelMixin, GenericViewSet):
    """Edição pontual (legenda/alt) e exclusão de uma foto avulsa - a criação
    acontece só via AlbumPainelViewSet.upload_fotos."""

    queryset = Foto.objects.all()
    serializer_class = FotoPainelSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, DjangoModelPermissionsWithView]


class CategoriaPainelViewSet(PainelModelViewSet):
    # Sem paginação: lista pequena, usada também no select de categoria do
    # formulário de álbum.
    queryset = Categoria.objects.all()
    serializer_class = CategoriaPainelSerializer
    pagination_class = None
