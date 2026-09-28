from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0004_categoria_descricao_ativo'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='conteudo',
            field=models.TextField(
                blank=True,
                help_text='Conteúdo legado em HTML. Preenchido apenas em posts criados antes do editor TipTap.',
            ),
        ),
        migrations.AddField(
            model_name='post',
            name='conteudo_json',
            field=models.JSONField(
                blank=True,
                null=True,
                help_text='Conteúdo estruturado do editor TipTap (fonte da verdade para posts novos/editados no painel).',
            ),
        ),
        migrations.AddField(
            model_name='post',
            name='tempo_leitura_minutos',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='post',
            name='status',
            field=models.CharField(
                choices=[('rascunho', 'Rascunho'), ('publicado', 'Publicado')],
                db_index=True,
                default='rascunho',
                max_length=20,
            ),
        ),
    ]
