from rest_framework.routers import DefaultRouter

from .views_painel import AlbumPainelViewSet, CategoriaPainelViewSet, FotoPainelViewSet

router = DefaultRouter()
router.register('albuns', AlbumPainelViewSet, basename='painel-album')
router.register('fotos', FotoPainelViewSet, basename='painel-foto')
router.register('categorias', CategoriaPainelViewSet, basename='painel-galeria-categoria')

urlpatterns = router.urls
