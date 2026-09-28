from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import Album, Foto


@receiver(post_delete, sender=Foto)
def delete_foto_files(sender, instance, **kwargs):
    for field_name in ('imagem', 'miniatura', 'imagem_media'):
        arquivo = getattr(instance, field_name)
        if arquivo:
            arquivo.storage.delete(arquivo.name)


@receiver(post_delete, sender=Album)
def delete_album_capa(sender, instance, **kwargs):
    if instance.capa:
        instance.capa.storage.delete(instance.capa.name)
