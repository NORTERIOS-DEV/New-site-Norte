from io import BytesIO

from django.conf import settings
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from PIL import Image
from rest_framework.test import APITestCase

TEST_STORAGES = {
    **settings.STORAGES,
    'default': {'BACKEND': 'django.core.files.storage.InMemoryStorage'},
}


def make_image_file(fmt='JPEG', name=None):
    image = Image.new('RGB', (50, 50), color=(10, 20, 30))
    buffer = BytesIO()
    image.save(buffer, format=fmt)
    buffer.seek(0)
    ext = fmt.lower()
    return SimpleUploadedFile(name or f'imagem.{ext}', buffer.read(), content_type=f'image/{ext}')


@override_settings(STORAGES=TEST_STORAGES)
class ImageUploadViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user('editor', password='senha123', is_staff=True)
        self.client.force_authenticate(user=self.user)

    def test_upload_gif_rejeitado(self):
        arquivo = make_image_file(fmt='GIF', name='animacao.gif')
        response = self.client.post(reverse('painel-upload-imagem'), {'imagem': arquivo}, format='multipart')

        self.assertEqual(response.status_code, 400)

    def test_upload_maior_que_5mb_rejeitado(self):
        conteudo = b'\xff' * (6 * 1024 * 1024)
        arquivo = SimpleUploadedFile('grande.jpg', conteudo, content_type='image/jpeg')

        response = self.client.post(reverse('painel-upload-imagem'), {'imagem': arquivo}, format='multipart')

        self.assertEqual(response.status_code, 400)

    def test_upload_jpg_valido_funciona(self):
        arquivo = make_image_file(fmt='JPEG', name='valida.jpg')
        response = self.client.post(reverse('painel-upload-imagem'), {'imagem': arquivo}, format='multipart')

        self.assertEqual(response.status_code, 201)
        self.assertIn('url', response.data)
