from django.core.exceptions import ValidationError

ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024


def validate_image_extension(file):
    nome = getattr(file, 'name', '') or ''
    extensao = nome.rsplit('.', 1)[-1].lower() if '.' in nome else ''
    if extensao not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError('Formato de imagem não suportado. Use jpg, png ou webp.')


def validate_image_size(file):
    if file.size > MAX_IMAGE_SIZE_BYTES:
        raise ValidationError('Imagem excede o tamanho máximo de 5MB.')
