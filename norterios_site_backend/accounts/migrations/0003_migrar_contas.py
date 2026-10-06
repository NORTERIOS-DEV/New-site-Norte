from django.db import migrations


def migrate_profiles(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    Perfil = apps.get_model('accounts', 'Perfil')
    for user in User.objects.using(schema_editor.connection.alias).all().iterator():
        Perfil.objects.using(schema_editor.connection.alias).get_or_create(user_id=user.pk, defaults={
            'nome_completo': ' '.join(filter(None, [user.first_name, user.last_name])),
            'tipo': 'gerente' if user.is_superuser or user.groups.filter(name='Gerenciador').exists() else 'comum',
        })


class Migration(migrations.Migration):
    dependencies = [('accounts', '0002_initial')]
    operations = [migrations.RunPython(migrate_profiles, migrations.RunPython.noop)]
