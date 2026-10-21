from datetime import date
from io import BytesIO

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image
from rest_framework.test import APITestCase

from .models import Album, Categoria, Foto

TEST_STORAGES = {
    **settings.STORAGES,
    'default': {'BACKEND': 'django.core.files.storage.InMemoryStorage'},
}


def make_test_image(width=2000, height=1000, fmt='JPEG', exif=None):
    image = Image.new('RGB', (width, height), color=(200, 100, 50))
    buffer = BytesIO()
    if exif is not None:
        image.save(buffer, format=fmt, exif=exif)
    else:
        image.save(buffer, format=fmt)
    buffer.seek(0)
    ext = 'jpg' if fmt == 'JPEG' else fmt.lower()
    content_type = 'image/jpeg' if fmt == 'JPEG' else f'image/{fmt.lower()}'
    return SimpleUploadedFile(f'foto.{ext}', buffer.read(), content_type=content_type)


@override_settings(STORAGES=TEST_STORAGES)
class FotoModelTests(TestCase):
    def setUp(self):
        self.album = Album.objects.create(titulo='Formação Tucuruí 2025', publicado=True)

    def test_gera_miniatura_e_media_em_webp_com_dimensoes(self):
        foto = Foto.objects.create(album=self.album, imagem=make_test_image(2000, 1000))

        self.assertTrue(foto.miniatura.name.endswith('.webp'))
        self.assertTrue(foto.imagem_media.name.endswith('.webp'))
        self.assertEqual(foto.largura, 2000)
        self.assertEqual(foto.altura, 1000)

        thumb = Image.open(foto.miniatura)
        self.assertEqual(thumb.format, 'WEBP')
        self.assertEqual(thumb.width, 400)
        self.assertEqual(thumb.height, 200)

        media = Image.open(foto.imagem_media)
        self.assertEqual(media.width, 1200)
        self.assertEqual(media.height, 600)

    def test_nao_reprocessa_ao_editar_apenas_legenda(self):
        foto = Foto.objects.create(album=self.album, imagem=make_test_image())
        nome_miniatura_original = foto.miniatura.name
        nome_media_original = foto.imagem_media.name

        foto = Foto.objects.get(pk=foto.pk)
        foto.legenda = 'Turma reunida no auditório'
        foto.save()

        foto.refresh_from_db()
        self.assertEqual(foto.miniatura.name, nome_miniatura_original)
        self.assertEqual(foto.imagem_media.name, nome_media_original)
        self.assertEqual(foto.legenda, 'Turma reunida no auditório')

    def test_corrige_orientacao_exif(self):
        # Tag 274 (Orientation) = 6 significa "rotacionar 90° à direita" para exibir corretamente.
        exif = Image.Exif()
        exif[274] = 6
        foto = Foto.objects.create(
            album=self.album, imagem=make_test_image(2000, 1000, exif=exif),
        )
        # Após a correção, a imagem original passa a ter as dimensões já rotacionadas.
        self.assertEqual(foto.largura, 1000)
        self.assertEqual(foto.altura, 2000)
        original = Image.open(foto.imagem)
        self.assertIsNone(original.getexif().get(274))

    def test_excluir_foto_remove_arquivos_do_storage(self):
        foto = Foto.objects.create(album=self.album, imagem=make_test_image())
        storage = foto.imagem.storage
        nomes = [foto.imagem.name, foto.miniatura.name, foto.imagem_media.name]
        self.assertTrue(all(storage.exists(n) for n in nomes))

        foto.delete()

        self.assertFalse(any(storage.exists(n) for n in nomes))

    def test_excluir_album_remove_arquivos_das_fotos_em_cascata(self):
        foto = Foto.objects.create(album=self.album, imagem=make_test_image())
        storage = foto.imagem.storage
        nomes = [foto.imagem.name, foto.miniatura.name, foto.imagem_media.name]

        self.album.delete()

        self.assertFalse(any(storage.exists(n) for n in nomes))
        self.assertFalse(Foto.objects.filter(pk=foto.pk).exists())


@override_settings(STORAGES=TEST_STORAGES)
class AlbumApiTests(APITestCase):
    def setUp(self):
        self.album_publicado = Album.objects.create(
            titulo='Formação Tucuruí 2025', publicado=True, data_evento=date(2025, 3, 10),
        )
        self.album_rascunho = Album.objects.create(titulo='Rascunho', publicado=False)
        Foto.objects.create(album=self.album_publicado, imagem=make_test_image(), legenda='Abertura')
        Foto.objects.create(album=self.album_publicado, imagem=make_test_image(), legenda='Encerramento')

    def test_lista_apenas_albuns_publicados(self):
        url = reverse('album-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        slugs = [item['slug'] for item in response.data['results']]
        self.assertIn(self.album_publicado.slug, slugs)
        self.assertNotIn(self.album_rascunho.slug, slugs)

    def test_detalhe_do_album_inclui_total_de_fotos_e_descricao(self):
        url = reverse('album-detail', args=[self.album_publicado.slug])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_fotos'], 2)
        self.assertIn('descricao', response.data)

    def test_album_nao_publicado_retorna_404(self):
        url = reverse('album-detail', args=[self.album_rascunho.slug])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)

    def test_fotos_do_album_sao_paginadas(self):
        url = reverse('album-fotos', args=[self.album_publicado.slug])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 2)
        self.assertIn('miniatura', response.data['results'][0])
        self.assertIn('imagem_media', response.data['results'][0])

    def test_fotos_de_album_nao_publicado_retorna_404(self):
        Foto.objects.create(album=self.album_rascunho, imagem=make_test_image())
        url = reverse('album-fotos', args=[self.album_rascunho.slug])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)


class GaleriaCategoriaFilterTests(APITestCase):
    def test_lista_somente_categorias_com_albuns_publicados_sem_duplicar(self):
        publica = Categoria.objects.create(nome='Eventos', slug='eventos')
        privada = Categoria.objects.create(nome='Rascunhos', slug='rascunhos')
        Categoria.objects.create(nome='Vazia', slug='vazia')
        Album.objects.create(titulo='Evento um', categoria=publica, publicado=True)
        Album.objects.create(titulo='Evento dois', categoria=publica, publicado=True)
        Album.objects.create(titulo='Rascunho', categoria=privada, publicado=False)
        response = self.client.get(reverse('galeria-categoria-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['slug'] for item in response.data], ['eventos'])

    def test_categoria_desaparece_ao_despublicar_ultimo_album(self):
        categoria = Categoria.objects.create(nome='Eventos', slug='eventos')
        album = Album.objects.create(titulo='Evento', categoria=categoria, publicado=True)
        album.publicado = False
        album.save()
        response = self.client.get(reverse('galeria-categoria-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])
