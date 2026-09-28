import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    """Passo 1/5 da troca de Post.autor de User para Autor: adiciona a FK nova
    em paralelo (nullable) para permitir o backfill de dados na migration
    seguinte antes de remover a FK antiga."""

    dependencies = [
        ('blog', '0005_post_conteudo_json'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='autor_novo',
            field=models.ForeignKey(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='posts',
                to='blog.autor',
            ),
        ),
    ]
