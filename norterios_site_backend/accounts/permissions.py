from rest_framework.permissions import DjangoModelPermissions


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
