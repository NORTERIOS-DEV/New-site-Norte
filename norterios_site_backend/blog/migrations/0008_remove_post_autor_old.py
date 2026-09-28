from django.db import migrations


class Migration(migrations.Migration):
    """Passo 3/5: remove a FK antiga (Post.autor -> User), agora que
    autor_novo já tem todo mundo preenchido."""

    dependencies = [
        ('blog', '0007_backfill_post_autor'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='autor',
        ),
    ]
