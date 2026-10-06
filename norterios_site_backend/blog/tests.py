from datetime import timedelta
from io import BytesIO
import json

from django.conf import settings
from django.contrib.auth.models import Group, User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from django.test import SimpleTestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from PIL import Image
from rest_framework.test import APITestCase

from .models import Autor, Post
from .validators import validate_tiptap_document


class TipTapFormattingTests(SimpleTestCase):
    def documento(self, mark):
        return {'type': 'doc', 'content': [{'type': 'paragraph', 'content': [
            {'type': 'text', 'text': 'Texto', 'marks': [mark]},
        ]}]}

    def test_aceita_estilos_tipograficos_combinados(self):
        validate_tiptap_document(self.documento({'type': 'textStyle', 'attrs': {
            'fontFamily': 'Georgia, serif', 'fontSize': '24px', 'color': '#427443',
        }}))

    def test_rejeita_marca_desconhecida(self):
        with self.assertRaises(ValidationError):
            validate_tiptap_document(self.documento({'type': 'unknownStyle'}))

TEST_STORAGES = {
    **settings.STORAGES,
    'default': {'BACKEND': 'django.core.files.storage.InMemoryStorage'},
}


def make_test_image():
    image = Image.new('RGB', (100, 100), color=(10, 20, 30))
    buffer = BytesIO()
    image.save(buffer, format='JPEG')
    buffer.seek(0)
    return SimpleUploadedFile('capa.jpg', buffer.read(), content_type='image/jpeg')


def doc_com_imagem(alt='Descrição da imagem'):
    attrs = {'src': 'https://exemplo.com/img.jpg'}
    if alt is not None:
        attrs['alt'] = alt
    return {
        'type': 'doc',
        'content': [{'type': 'paragraph', 'content': [{'type': 'text', 'text': 'Olá'}]}, {'type': 'image', 'attrs': attrs}],
    }


@override_settings(STORAGES=TEST_STORAGES)
class PostPainelApiTests(APITestCase):
    def setUp(self):
        self.autor = Autor.objects.create(nome='Autora Teste')
        self.user = User.objects.create_user('gerenciador', password='senha123', is_staff=True)
        grupo = Group.objects.get(name='Gerenciador')
        self.user.groups.add(grupo)
        self.client.force_authenticate(user=self.user)

    def _criar_post(self, **extra):
        dados = {
            'titulo': 'Post de teste',
            'resumo': 'Resumo do post',
            'autor': self.autor.id,
            'status': Post.STATUS_RASCUNHO,
        }
        dados.update(extra)
        return self.client.post(reverse('painel-post-list'), dados, format='multipart')

    def test_publicar_sem_capa_falha(self):
        post = Post.objects.create(titulo='Sem capa', resumo='Resumo', autor=self.autor)
        response = self.client.post(reverse('painel-post-publicar', args=[post.id]))

        self.assertEqual(response.status_code, 400)
        self.assertIn('imagem_capa', response.data)
        post.refresh_from_db()
        self.assertEqual(post.status, Post.STATUS_RASCUNHO)

    def test_salva_e_reabre_post_com_estilos_tipograficos(self):
        doc = {'type': 'doc', 'content': [{'type': 'paragraph', 'content': [{
            'type': 'text', 'text': 'Texto formatado', 'marks': [
                {'type': 'bold'},
                {'type': 'textStyle', 'attrs': {
                    'fontFamily': 'Georgia, serif', 'fontSize': '24px', 'color': '#427443',
                }},
            ],
        }]}]}
        response = self._criar_post(conteudo_json=json.dumps(doc))
        self.assertEqual(response.status_code, 201)
        post = Post.objects.get(pk=response.data['id'])
        self.assertEqual(post.conteudo_json, doc)
        detail = self.client.get(reverse('painel-post-detail', args=[post.id]))
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data['conteudo_json'], doc)

    def test_api_rejeita_marca_desconhecida(self):
        doc = {'type': 'doc', 'content': [{'type': 'paragraph', 'content': [{
            'type': 'text', 'text': 'Texto', 'marks': [{'type': 'unknownStyle'}],
        }]}]}
        response = self._criar_post(conteudo_json=json.dumps(doc))
        self.assertEqual(response.status_code, 400)
        self.assertIn('conteudo_json', response.data)

    def test_publicar_com_imagem_sem_alt_falha(self):
        post = Post.objects.create(
            titulo='Com imagem sem alt', resumo='Resumo', autor=self.autor,
            imagem_capa=make_test_image(), conteudo_json=doc_com_imagem(alt=''),
        )
        response = self.client.post(reverse('painel-post-publicar', args=[post.id]))

        self.assertEqual(response.status_code, 400)
        self.assertIn('conteudo_json', response.data)

    def test_publicar_com_tudo_preenchido_funciona(self):
        post = Post.objects.create(
            titulo='Completo', resumo='Resumo', autor=self.autor,
            imagem_capa=make_test_image(), conteudo_json=doc_com_imagem(),
        )
        response = self.client.post(reverse('painel-post-publicar', args=[post.id]))

        self.assertEqual(response.status_code, 200)
        post.refresh_from_db()
        self.assertEqual(post.status, Post.STATUS_PUBLICADO)
        self.assertEqual(post.status_efetivo, Post.STATUS_PUBLICADO)

    def test_agendar_com_data_passada_falha(self):
        response = self._criar_post(
            imagem_capa=make_test_image(),
            status=Post.STATUS_AGENDADO,
            data_publicacao=(timezone.now() - timedelta(days=1)).isoformat(),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('data_publicacao', response.data)

    def test_agendar_com_data_futura_grava_publicado_e_status_efetivo_agendado(self):
        data_futura = timezone.now() + timedelta(days=3)
        response = self._criar_post(
            imagem_capa=make_test_image(),
            status=Post.STATUS_AGENDADO,
            data_publicacao=data_futura.isoformat(),
        )

        self.assertEqual(response.status_code, 201, response.data)
        post = Post.objects.get(id=response.data['id'])
        self.assertEqual(post.status, Post.STATUS_PUBLICADO)
        self.assertEqual(post.status_efetivo, Post.STATUS_AGENDADO)
        self.assertEqual(response.data['status_efetivo'], Post.STATUS_AGENDADO)

    def test_filtro_status_agendado_e_publicado_nao_se_misturam(self):
        agendado = Post.objects.create(
            titulo='Agendado', resumo='R', autor=self.autor, status=Post.STATUS_PUBLICADO,
            data_publicacao=timezone.now() + timedelta(days=1),
        )
        publicado = Post.objects.create(
            titulo='Publicado', resumo='R', autor=self.autor, status=Post.STATUS_PUBLICADO,
            data_publicacao=timezone.now() - timedelta(days=1),
        )

        resp_agendado = self.client.get(reverse('painel-post-list'), {'status': 'agendado'})
        ids_agendado = [p['id'] for p in resp_agendado.data['results']]
        self.assertIn(agendado.id, ids_agendado)
        self.assertNotIn(publicado.id, ids_agendado)

        resp_publicado = self.client.get(reverse('painel-post-list'), {'status': 'publicado'})
        ids_publicado = [p['id'] for p in resp_publicado.data['results']]
        self.assertIn(publicado.id, ids_publicado)
        self.assertNotIn(agendado.id, ids_publicado)

    def test_apenas_um_post_fica_em_destaque(self):
        post1 = Post.objects.create(titulo='Um', resumo='R', autor=self.autor, destaque=True)
        post2 = Post.objects.create(titulo='Dois', resumo='R', autor=self.autor, destaque=True)

        post1.refresh_from_db()
        post2.refresh_from_db()
        self.assertFalse(post1.destaque)
        self.assertTrue(post2.destaque)
        self.assertEqual(Post.objects.filter(destaque=True).count(), 1)
