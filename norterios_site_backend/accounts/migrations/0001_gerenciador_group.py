from django.apps import apps as global_apps
from django.contrib.auth.management import create_permissions
from django.contrib.contenttypes.management import create_contenttypes
from django.db import migrations

MODELOS_GERENCIADOR = [
    ('blog', 'post'),
    ('blog', 'categoria'),
    ('blog', 'autor'),
    ('galeria', 'album'),
    ('galeria', 'foto'),
    ('galeria', 'categoria'),
]
CODENAMES = ['add', 'change', 'delete', 'view']


def criar_grupo_gerenciador(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Permission = apps.get_model('auth', 'Permission')
    ContentType = apps.get_model('contenttypes', 'ContentType')
    User = apps.get_model('auth', 'User')

    # ContentType/Permission são criados por um sinal post_migrate, que só
    # dispara depois que TODAS as migrations do comando terminam - num banco
    # novo (ex.: banco de teste), ainda não existem neste ponto do meio da
    # migration para os models criados agora. Precisa criar na mão.
    for app_label in ('blog', 'galeria'):
        app_config = global_apps.get_app_config(app_label)
        create_contenttypes(app_config, verbosity=0)
        create_permissions(app_config, verbosity=0)

    grupo, _ = Group.objects.get_or_create(name='Gerenciador')

    permissoes = []
    for app_label, model_name in MODELOS_GERENCIADOR:
        content_type = ContentType.objects.get(app_label=app_label, model=model_name)
        for codename in CODENAMES:
            try:
                permissoes.append(
                    Permission.objects.get(content_type=content_type, codename=f'{codename}_{model_name}')
                )
            except Permission.DoesNotExist:
                pass
    grupo.permissions.set(permissoes)

    for user in User.objects.filter(is_staff=True):
        user.groups.add(grupo)


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0010_post_autor_required'),
        ('galeria', '0002_categoria_album_categoria'),
        # RunPython abaixo mexe com ContentType/Permission - sem essas duas
        # dependencias explicitas o Django pode rodar esta migration antes
        # das migrations proprias de contenttypes/auth terminarem num banco
        # novo, quebrando o bulk_create do ContentType.
        ('contenttypes', '__latest__'),
        ('auth', '__latest__'),
    ]

    operations = [
        migrations.RunPython(criar_grupo_gerenciador, reverse_noop),
    ]
