import os
from io import BytesIO

from django.core.files.base import ContentFile
from PIL import Image, ImageOps

MINIATURA_LARGURA = 400
MEDIA_LARGURA = 1200


def process_new_image(file):
    """Corrige a orientação EXIF, remove metadados e reencoda a imagem original.

    Retorna (ContentFile pronto para ser atribuído ao campo, imagem PIL já
    corrigida para reaproveitar na geração das variantes, largura, altura).
    """
    file.seek(0)
    original = Image.open(file)
    original.load()
    fmt = (original.format or 'JPEG').upper()

    image = ImageOps.exif_transpose(original)
    if fmt == 'JPEG' and image.mode != 'RGB':
        image = image.convert('RGB')
    # exif_transpose() only clears the orientation tag; drop the rest of the
    # metadata (EXIF, ICC profile, etc.) so nothing leaks into the saved file.
    image.info = {}

    buffer = BytesIO()
    save_kwargs = {'quality': 92, 'optimize': True} if fmt == 'JPEG' else {}
    image.save(buffer, format=fmt, **save_kwargs)
    buffer.seek(0)

    content = ContentFile(buffer.read(), name=file.name)
    return content, image, image.width, image.height


def make_variant(image, max_width, quality=82):
    """Redimensiona proporcionalmente (se necessário) e retorna um ContentFile WebP."""
    variante = image
    largura, altura = variante.size
    if largura > max_width:
        nova_altura = round(altura * (max_width / largura))
        variante = variante.resize((max_width, nova_altura), Image.LANCZOS)

    if variante.mode not in ('RGB', 'RGBA'):
        variante = variante.convert('RGB')

    buffer = BytesIO()
    variante.save(buffer, format='WEBP', quality=quality)
    buffer.seek(0)
    return ContentFile(buffer.read())


def build_foto_variants(foto, image):
    """Gera miniatura (~400px) e versão média (~1200px) em WebP para uma Foto."""
    base_name = os.path.splitext(os.path.basename(foto.imagem.name))[0]

    foto.miniatura.save(
        f'{base_name}-thumb.webp', make_variant(image, MINIATURA_LARGURA), save=False,
    )
    foto.imagem_media.save(
        f'{base_name}-media.webp', make_variant(image, MEDIA_LARGURA, quality=85), save=False,
    )
    foto.largura, foto.altura = image.size


def delete_arquivos(storage, nomes):
    """Remove do storage cada nome de arquivo não vazio na lista."""
    for nome in nomes:
        if nome:
            storage.delete(nome)
