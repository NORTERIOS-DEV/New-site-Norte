from rest_framework.permissions import DjangoModelPermissions, BasePermission
from .models import perfil_usuario


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and perfil_usuario(request.user).tipo == 'gerente'


class IsEditor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and perfil_usuario(request.user).tipo in ('gerente', 'autor')


class CategoryPermission(IsEditor):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and (request.method in ('GET', 'HEAD', 'OPTIONS') or perfil_usuario(request.user).tipo == 'gerente')


class DjangoModelPermissionsWithView(DjangoModelPermissions):
    """DjangoModelPermissions also gating GET/HEAD/OPTIONS behind `view_<model>`.

    DRF's base class only restricts unsafe methods, which is right for a
    public read + admin-write split but wrong here: every painel endpoint is
    authenticated-only, so listing/reading must also require a permission.
    """

    perms_map = {
        **DjangoModelPermissions.perms_map,
        'GET': ['%(app_label)s.view_%(model_name)s'],
    }
