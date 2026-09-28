import uuid

from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from galeria.services import process_new_image

EXTENSOES_PERMITIDAS = {'jpg', 'jpeg', 'png', 'webp', 'gif'}
TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024


class ImageUploadView(APIView):
    """Upload genérico de uma imagem (usado pelo comando de inserir imagem do
    TipTap). Capa de post/álbum e foto de autor não passam por aqui - são
    ImageFields normais, enviados direto no multipart do próprio formulário."""

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        arquivo = request.FILES.get('imagem')
        if not arquivo:
            return Response({'detail': "Envie um arquivo no campo 'imagem'."}, status=status.HTTP_400_BAD_REQUEST)

        extensao = arquivo.name.rsplit('.', 1)[-1].lower() if '.' in arquivo.name else ''
        if extensao not in EXTENSOES_PERMITIDAS:
            return Response({'detail': 'Formato de imagem não suportado.'}, status=status.HTTP_400_BAD_REQUEST)

        if arquivo.size > TAMANHO_MAXIMO_BYTES:
            return Response({'detail': 'Imagem excede o tamanho máximo de 5MB.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            content, _imagem_pil, _largura, _altura = process_new_image(arquivo)
        except Exception:
            return Response(
                {'detail': 'Não foi possível processar a imagem enviada.'}, status=status.HTTP_400_BAD_REQUEST,
            )

        caminho = default_storage.save(f'blog/conteudo/{uuid.uuid4()}.{extensao}', content)
        return Response({'url': default_storage.url(caminho)}, status=status.HTTP_201_CREATED)
