from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .authentication import SessionAuthentication

from .permissions import IsManager


class PainelModelViewSet(ModelViewSet):
    """Base viewset for every authenticated /api/painel/ endpoint.

    Public read-only viewsets (blog/galeria's existing ReadOnlyModelViewSets)
    are untouched and keep relying on DRF's implicit AllowAny default -
    auth/permissions here are opt-in per viewset, not a global default.
    """

    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated, IsManager]
