from rest_framework.routers import DefaultRouter

from .views import AlbumViewSet, CategoriaViewSet

router = DefaultRouter()
router.register('albuns', AlbumViewSet, basename='album')
router.register('categorias', CategoriaViewSet, basename='galeria-categoria')

urlpatterns = router.urls
