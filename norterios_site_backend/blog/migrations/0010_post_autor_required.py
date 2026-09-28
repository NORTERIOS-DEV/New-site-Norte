import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    """Passo 5/5: torna Post.autor obrigatório de novo (estava nullable só
    durante a transição), igual o campo original apontando pra User era."""

    dependencies = [
        ('blog', '0009_rename_post_autor_novo_autor'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='autor',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='posts',
                to='blog.autor',
            ),
        ),
    ]
