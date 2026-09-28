from rest_framework.routers import DefaultRouter

from .views_painel import AutorPainelViewSet, CategoriaPainelViewSet, PostPainelViewSet

router = DefaultRouter()
router.register('posts', PostPainelViewSet, basename='painel-post')
router.register('categorias', CategoriaPainelViewSet, basename='painel-categoria')
router.register('autores', AutorPainelViewSet, basename='painel-autor')

urlpatterns = router.urls
