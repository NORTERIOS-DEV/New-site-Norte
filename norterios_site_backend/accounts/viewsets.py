from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.authentication import JWTAuthentication

from .permissions import DjangoModelPermissionsWithView


class PainelModelViewSet(ModelViewSet):
    """Base viewset for every authenticated /api/painel/ endpoint.

    Public read-only viewsets (blog/galeria's existing ReadOnlyModelViewSets)
    are untouched and keep relying on DRF's implicit AllowAny default -
    auth/permissions here are opt-in per viewset, not a global default.
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, DjangoModelPermissionsWithView]
