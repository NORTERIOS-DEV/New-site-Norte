from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import filters, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from blog.serializers_painel import AutorPainelSerializer
from .authentication import SessionAuthentication, SessionTokenSerializer, SessionRefreshSerializer
from .models import Perfil, perfil_usuario
from .serializers import UserSerializer, MeSerializer, PasswordSerializer
from .viewsets import PainelModelViewSet


class LoginView(TokenObtainPairView):
    serializer_class = SessionTokenSerializer


class RefreshView(TokenRefreshView):
    serializer_class = SessionRefreshSerializer


def change_password(user, data, own=False):
    serializer = PasswordSerializer(data=data, context={'user': user, 'self': own})
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        perfil = Perfil.objects.select_for_update().get(user=user)
        user.set_password(serializer.validated_data['password'])
        user.save(update_fields=['password'])
        perfil.versao_sessao += 1
        perfil.save(update_fields=['versao_sessao'])
    return Response({'detail': 'Senha alterada. Entre novamente.'})


class MeView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        perfil_usuario(request.user)
        return Response(UserSerializer(request.user).data)

    @transaction.atomic
    def patch(self, request):
        list(Perfil.objects.select_for_update().filter(tipo='gerente').order_by('pk'))
        serializer = MeSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class MePasswordView(MeView):
    http_method_names = ['post', 'options']

    def post(self, request):
        return change_password(request.user, request.data, own=True)


class OwnAutorSerializer(AutorPainelSerializer):
    class Meta(AutorPainelSerializer.Meta):
        read_only_fields = ['nome', 'cargo', 'ativo']

    def validate(self, attrs):
        forbidden = set(self.initial_data) - {'nome_exibicao', 'foto', 'mini_bio', 'formacao_especialidade', 'instagram', 'linkedin'}
        if forbidden:
            raise serializers.ValidationError({key: 'Campo não permitido.' for key in forbidden})
        return attrs

    def validate_foto(self, value):
        from uploads.validators import validate_image_extension, validate_image_size
        from django.core.exceptions import ValidationError
        if value:
            try:
                validate_image_extension(value)
                validate_image_size(value)
            except ValidationError as exc:
                raise serializers.ValidationError(exc.messages)
        return value


class MeAutorView(MeView):
    def get_autor(self, request):
        perfil = perfil_usuario(request.user)
        if perfil.tipo != 'autor' or not perfil.autor_id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Disponível somente para autores.')
        return perfil.autor

    def get(self, request):
        return Response(OwnAutorSerializer(self.get_autor(request), context={'request': request}).data)

    def patch(self, request):
        serializer = OwnAutorSerializer(self.get_autor(request), data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserViewSet(PainelModelViewSet):
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'perfil__nome_completo']

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # Serialize account writes before validating case-insensitive identity.
        # Existing legacy identities remain intact; new duplicates are rejected.
        list(Perfil.objects.select_for_update().filter(tipo='gerente').order_by('pk'))
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        qs = User.objects.select_related('perfil').order_by('id')
        if self.request.query_params.get('tipo'):
            qs = qs.filter(perfil__tipo=self.request.query_params['tipo'])
        if self.request.query_params.get('is_active') in ('true', 'false'):
            qs = qs.filter(is_active=self.request.query_params['is_active'] == 'true')
        return qs

    def protect(self, user, data=None, deleting=False):
        data = data or {}
        removing = deleting or data.get('is_active') is False or data.get('tipo', perfil_usuario(user).tipo) != 'gerente'
        if user.pk == self.request.user.pk and (deleting or data.get('is_active') is False):
            raise serializers.ValidationError({'detail': 'Você não pode excluir ou desativar sua própria conta.'})
        if user.is_active and perfil_usuario(user).tipo == 'gerente' and removing:
            if not User.objects.filter(is_active=True, perfil__tipo='gerente').exclude(pk=user.pk).exists():
                raise serializers.ValidationError({'detail': 'É necessário manter pelo menos um gerente ativo.'})

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        list(Perfil.objects.select_for_update().filter(tipo='gerente').order_by('pk'))
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        data = dict(serializer.validated_data)
        data.update(data.pop('perfil', {}))
        self.protect(self.get_object(), data)
        serializer.save()
        return Response(serializer.data)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        list(Perfil.objects.select_for_update().filter(tipo='gerente').order_by('pk'))
        self.protect(self.get_object(), deleting=True)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def senha(self, request, pk=None):
        return change_password(self.get_object(), request.data)
