from rest_framework.routers import DefaultRouter

from .views import CategoriaViewSet, PostViewSet

router = DefaultRouter()
router.register('posts', PostViewSet, basename='post')
router.register('categorias', CategoriaViewSet, basename='categoria')

urlpatterns = router.urls
