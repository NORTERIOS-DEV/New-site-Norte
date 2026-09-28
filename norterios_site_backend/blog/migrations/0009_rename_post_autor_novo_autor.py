from django.db import migrations


class Migration(migrations.Migration):
    """Passo 4/5: autor_novo assume o nome definitivo autor."""

    dependencies = [
        ('blog', '0008_remove_post_autor_old'),
    ]

    operations = [
        migrations.RenameField(
            model_name='post',
            old_name='autor_novo',
            new_name='autor',
        ),
    ]
