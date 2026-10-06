from django.contrib.auth.models import User, Group
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from blog.models import Autor, Post
from .models import perfil_usuario
from django.test import TransactionTestCase
from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import override_settings
from django.utils import timezone
from datetime import timedelta
from blog.tests import TEST_STORAGES, make_test_image


class AccountsTests(APITestCase):
    def setUp(self):
        self.manager = User.objects.create_user('manager', password='Complex!Pass827', is_superuser=True)
        perfil_usuario(self.manager)
        self.client.force_authenticate(self.manager)
        self.payload = dict(username='newauthor', email='author@example.org', nome_completo='Maria Silva', telefone='(85) 99999-1234', cargo='Redatora', tipo='autor', password='Unique!Secret924')

    def create(self, **extra):
        return self.client.post('/api/painel/usuarios/', self.payload | extra, format='json')

    def test_crud_preserves_author_and_posts(self):
        legacy = Autor.objects.create(nome='Maria Silva')
        response = self.create()
        self.assertEqual(response.status_code, 201, response.data)
        self.assertNotIn('password', response.data)
        user = User.objects.get(pk=response.data['id'])
        author = user.perfil.autor
        self.assertNotEqual(author.pk, legacy.pk)
        post = Post.objects.create(titulo='Meu texto', resumo='Texto', autor=author)
        detail = f'/api/painel/usuarios/{user.pk}/'
        self.assertEqual(self.client.get(detail).status_code, 200)
        self.assertEqual(self.client.patch(detail, {'nome_completo': 'Maria Souza', 'cargo': 'Editora'}, format='json').status_code, 200)
        author.refresh_from_db()
        self.assertEqual((author.nome, author.cargo), ('Maria Souza', 'Editora'))
        self.assertEqual(self.client.patch(detail, {'tipo': 'comum'}, format='json').status_code, 200)
        self.assertEqual(self.client.delete(detail).status_code, 204)
        self.assertTrue(Autor.objects.filter(pk=author.pk).exists())
        self.assertTrue(Post.objects.filter(pk=post.pk).exists())

    def test_required_duplicate_and_password_fields(self):
        for field in self.payload:
            body = self.payload.copy(); body.pop(field)
            self.assertEqual(self.client.post('/api/painel/usuarios/', body, format='json').status_code, 400, field)
        self.assertEqual(self.create().status_code, 201)
        self.assertEqual(self.create(username='NEWAUTHOR', email='other@example.org').status_code, 400)
        self.assertEqual(self.create(username='other', email='AUTHOR@EXAMPLE.ORG').status_code, 400)
        self.assertEqual(self.create(username='other', email='other@example.org', password='123').status_code, 400)
        self.assertEqual(self.create(username='other', email='invalid').status_code, 400)

    def test_manager_protection(self):
        path = f'/api/painel/usuarios/{self.manager.pk}/'
        self.assertEqual(self.client.delete(path).status_code, 400)
        self.assertEqual(self.client.patch(path, {'is_active': False}, format='json').status_code, 400)
        self.assertEqual(self.client.patch(path, {'tipo': 'comum'}, format='json').status_code, 400)
        self.assertEqual(self.create(username='second', email='second@example.org', tipo='gerente').status_code, 201)
        self.assertEqual(self.client.patch(path, {'tipo': 'comum'}, format='json').status_code, 200)

    def test_self_profile_restrictions(self):
        self.assertEqual(self.client.patch('/api/painel/auth/me/', {'nome_completo': 'Gestora', 'telefone': '85999991234', 'email': 'me@example.org'}, format='json').status_code, 200)
        for field, value in [('tipo', 'autor'), ('username', 'hacked'), ('cargo', 'Novo'), ('is_active', False), ('password', 'Hacked!2738')]:
            self.assertEqual(self.client.patch('/api/painel/auth/me/', {field: value}, format='json').status_code, 400)

    def test_author_scope_and_admin_denials(self):
        response = self.create()
        user = User.objects.get(pk=response.data['id'])
        other = Autor.objects.create(nome='Outra')
        theirs = Post.objects.create(titulo='Privado', resumo='Texto', autor=other)
        self.client.force_authenticate(user)
        for path in ['/api/painel/usuarios/', '/api/painel/autores/', '/api/painel/galeria/albuns/']:
            self.assertEqual(self.client.get(path).status_code, 403, path)

        self.assertEqual(self.client.get('/api/painel/categorias/').status_code, 200)
        self.assertEqual(self.client.post('/api/painel/categorias/', {'nome': 'Nova'}).status_code, 403)
        base = {'titulo': 'Meu post', 'resumo': 'Texto', 'status': 'rascunho'}
        own = self.client.post('/api/painel/posts/', base, format='json')
        self.assertEqual(own.status_code, 201, own.data)
        self.assertEqual(own.data['autor'], user.perfil.autor_id)
        for method in ['get', 'patch', 'delete', 'post']:
            path = f'/api/painel/posts/{theirs.pk}/' + ('publicar/' if method == 'post' else '')
            self.assertEqual(getattr(self.client, method)(path).status_code, 404)
        self.assertEqual(self.client.get('/api/painel/posts/').data['count'], 1)
        self.assertEqual(self.client.patch(f"/api/painel/posts/{own.data['id']}/", {'autor': other.pk}, format='json').status_code, 400)
        self.assertEqual(self.client.patch(f"/api/painel/posts/{own.data['id']}/", {'destaque': True}, format='json').status_code, 400)
        self.assertEqual(self.client.patch('/api/painel/auth/me/autor/', {'mini_bio': 'Minha bio', 'nome_exibicao': 'Maria'}, format='json').status_code, 200)
        self.assertEqual(self.client.patch('/api/painel/auth/me/autor/', {'cargo': 'Alterado'}, format='json').status_code, 400)
        self.client.force_authenticate(self.manager)
        self.client.patch(f'/api/painel/usuarios/{user.pk}/', {'tipo': 'comum'}, format='json')
        self.client.force_authenticate(user)
        for path in ['/api/painel/posts/', '/api/painel/categorias/', '/api/painel/usuarios/', '/api/painel/uploads/imagem/']:
            self.assertEqual(self.client.get(path).status_code, 403, path)

    @override_settings(STORAGES=TEST_STORAGES)
    def test_author_can_publish_schedule_and_delete_own_post(self):
        user = User.objects.get(pk=self.create().data['id'])
        self.client.force_authenticate(user)
        response = self.client.post('/api/painel/posts/', {'titulo': 'Meu artigo', 'resumo': 'Resumo', 'status': 'rascunho', 'imagem_capa': make_test_image()}, format='multipart')
        self.assertEqual(response.status_code, 201, response.data)
        path = f"/api/painel/posts/{response.data['id']}/"
        self.assertEqual(self.client.post(path + 'publicar/').status_code, 200)
        self.assertEqual(self.client.post(path + 'despublicar/').status_code, 200)
        scheduled = self.client.patch(path, {'status': 'agendado', 'data_publicacao': (timezone.now() + timedelta(days=1)).isoformat()}, format='json')
        self.assertEqual(scheduled.status_code, 200, scheduled.data)
        self.assertEqual(scheduled.data['status_efetivo'], 'agendado')
        self.assertEqual(self.client.delete(path).status_code, 204)

    def tokens(self, user):
        self.client.force_authenticate(None)
        response = self.client.post('/api/painel/auth/login/', {'username': user.username, 'password': 'Unique!Secret924'}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        return response.data

    def assert_revoked(self, tokens):
        self.client.force_authenticate(None)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        self.assertEqual(self.client.get('/api/painel/auth/me/').status_code, 401)
        self.client.credentials()
        self.assertEqual(self.client.post('/api/painel/auth/login/refresh/', {'refresh': tokens['refresh']}, format='json').status_code, 401)

    def test_login_refresh_password_and_revocation(self):
        user = User.objects.get(pk=self.create().data['id'])
        tokens = self.tokens(user)
        self.assertEqual(self.client.post('/api/painel/auth/login/refresh/', {'refresh': tokens['refresh']}, format='json').status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        self.assertEqual(self.client.post('/api/painel/auth/me/senha/', {'senha_atual': 'wrong', 'password': 'Brand!NewSecret72'}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/painel/auth/me/senha/', {'senha_atual': 'Unique!Secret924', 'password': 'Brand!NewSecret72'}, format='json').status_code, 200)
        self.assert_revoked(tokens)

    def test_deactivation_deletion_reset_and_legacy_tokens(self):
        for operation in ['deactivate', 'delete', 'reset']:
            self.client.credentials(); self.client.force_authenticate(self.manager)
            user = User.objects.get(pk=self.create(username=operation, email=f'{operation}@example.org').data['id'])
            tokens = self.tokens(user)
            self.client.force_authenticate(self.manager)
            path = f'/api/painel/usuarios/{user.pk}/'
            if operation == 'delete': self.client.delete(path)
            elif operation == 'reset': self.client.post(path + 'senha/', {'password': 'Brand!NewSecret72'}, format='json')
            else: self.client.patch(path, {'is_active': False}, format='json')
            self.assert_revoked(tokens)
        token = RefreshToken.for_user(self.manager)
        self.assert_revoked({'access': str(token.access_token), 'refresh': str(token)})

    def test_existing_roles_preserved(self):
        legacy = User.objects.create_user('legacy', first_name='Ana', last_name='Silva')
        legacy.groups.add(Group.objects.get(name='Gerenciador'))
        self.assertEqual(perfil_usuario(legacy).tipo, 'gerente')
        self.assertEqual(legacy.perfil.nome_completo, 'Ana Silva')
        self.assertEqual(legacy.perfil.telefone, '')
        common = User.objects.create_user('common')
        self.assertEqual(perfil_usuario(common).tipo, 'comum')


class ProfileMigrationTests(TransactionTestCase):
    def test_existing_database_preserves_accounts_authors_posts(self):
        executor = MigrationExecutor(connection)
        executor.migrate([('accounts', '0001_gerenciador_group')])
        old = executor.loader.project_state().apps
        UserModel = old.get_model('auth', 'User')
        GroupModel = old.get_model('auth', 'Group')
        AuthorModel = old.get_model('blog', 'Autor')
        PostModel = old.get_model('blog', 'Post')
        manager = UserModel.objects.create(username='oldmanager', first_name='Ana', last_name='Silva', password='unchanged-hash')
        manager.groups.add(GroupModel.objects.get_or_create(name='Gerenciador')[0])
        root = UserModel.objects.create(username='oldroot', is_superuser=True)
        common = UserModel.objects.create(username='oldcommon')
        author = AuthorModel.objects.create(nome='Autoria antiga')
        post = PostModel.objects.create(titulo='Post antigo', resumo='Resumo', autor=author)
        try:
            executor = MigrationExecutor(connection)
            executor.migrate(executor.loader.graph.leaf_nodes())
            self.assertEqual(perfil_usuario(User.objects.get(pk=manager.pk)).tipo, 'gerente')
            self.assertEqual(User.objects.get(pk=manager.pk).password, 'unchanged-hash')
            self.assertEqual(perfil_usuario(User.objects.get(pk=root.pk)).tipo, 'gerente')
            profile = perfil_usuario(User.objects.get(pk=common.pk))
            self.assertEqual(profile.tipo, 'comum')
            self.assertEqual((profile.telefone, profile.cargo, profile.nome_completo, profile.autor_id), ('', '', '', None))
            self.assertEqual(Autor.objects.get(pk=author.pk).nome, 'Autoria antiga')
            self.assertEqual(Post.objects.get(pk=post.pk).autor_id, author.pk)
        finally:
            executor = MigrationExecutor(connection)
            executor.migrate(executor.loader.graph.leaf_nodes())
