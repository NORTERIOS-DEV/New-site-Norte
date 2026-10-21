from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('blog', '0012_post_meta_description_post_meta_title_post_og_image_and_more'),
    ]

    operations = [
        migrations.RemoveConstraint(model_name='post', name='post_unico_destaque'),
    ]
