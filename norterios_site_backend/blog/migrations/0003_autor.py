from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0002_post_destaque'),
    ]

    operations = [
        migrations.CreateModel(
            name='Autor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=150)),
                ('foto', models.ImageField(blank=True, null=True, upload_to='blog/autores/%Y/%m/')),
                ('mini_bio', models.TextField(blank=True, verbose_name='Mini biografia')),
                ('cargo', models.CharField(blank=True, max_length=120)),
                ('ativo', models.BooleanField(default=True)),
            ],
            options={
                'ordering': ['nome'],
            },
        ),
    ]
