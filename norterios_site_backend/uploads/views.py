import uuid

from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.authentication import SessionAuthentication
from accounts.permissions import IsEditor

from galeria.services import process_new_image

from .validators import validate_image_extension, validate_image_size


class ImageUploadView(APIView):
    """Upload genérico de uma imagem (usado pelo comando de inserir imagem do
    TipTap). Capa de post/álbum e foto de autor não passam por aqui - são
    ImageFields normais, enviados direto no multipart do próprio formulário."""

    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated, IsEditor]
    parser_classes = [MultiPartParser]

    def post(self, request):
        arquivo = request.FILES.get('imagem')
        if not arquivo:
            return Response({'detail': "Envie um arquivo no campo 'imagem'."}, status=status.HTTP_400_BAD_REQUEST)

        extensao = arquivo.name.rsplit('.', 1)[-1].lower() if '.' in arquivo.name else ''
        try:
            validate_image_extension(arquivo)
            validate_image_size(arquivo)
        except ValidationError as exc:
            return Response({'detail': exc.messages[0]}, status=status.HTTP_400_BAD_REQUEST)

        try:
            content, _imagem_pil, _largura, _altura = process_new_image(arquivo)
        except Exception:
            return Response(
                {'detail': 'Não foi possível processar a imagem enviada.'}, status=status.HTTP_400_BAD_REQUEST,
            )

        caminho = default_storage.save(f'blog/conteudo/{uuid.uuid4()}.{extensao}', content)
        return Response({'url': default_storage.url(caminho)}, status=status.HTTP_201_CREATED)
