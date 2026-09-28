from django.conf import settings
from django.db import migrations


def backfill_autores(apps, schema_editor):
    """Passo 2/5: cria um Autor para cada User distinto já usado como
    Post.autor e aponta autor_novo para ele, preservando a autoria dos
    posts existentes."""
    Post = apps.get_model('blog', 'Post')
    Autor = apps.get_model('blog', 'Autor')
    User = apps.get_model(settings.AUTH_USER_MODEL)

    autor_por_user_id = {}
    for post in Post.objects.all():
        user_id = post.autor_id
        if user_id not in autor_por_user_id:
            user = User.objects.get(pk=user_id)
            nome = f'{user.first_name} {user.last_name}'.strip() or user.username
            autor, _ = Autor.objects.get_or_create(nome=nome, defaults={'ativo': True})
            autor_por_user_id[user_id] = autor
        post.autor_novo_id = autor_por_user_id[user_id].id
        post.save(update_fields=['autor_novo'])


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0006_post_autor_novo'),
    ]

    operations = [
        migrations.RunPython(backfill_autores, reverse_noop),
    ]
