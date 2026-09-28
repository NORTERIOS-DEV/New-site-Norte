from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0003_autor'),
    ]

    operations = [
        migrations.AddField(
            model_name='categoria',
            name='descricao',
            field=models.TextField(blank=True, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='categoria',
            name='ativo',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='categoria',
            name='slug',
            field=models.SlugField(blank=True, max_length=90, unique=True),
        ),
    ]
