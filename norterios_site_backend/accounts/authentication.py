from django.contrib.auth.models import User
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from .models import perfil_usuario


def validar_sessao(token):
    user = User.objects.filter(pk=token.get('user_id'), is_active=True).first()
    if not user or token.get('versao_sessao') != perfil_usuario(user).versao_sessao:
        raise AuthenticationFailed('Sessão expirada. Entre novamente.')
    return user


class SessionAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        return validar_sessao(validated_token)


class SessionTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['versao_sessao'] = perfil_usuario(user).versao_sessao
        return token


class SessionRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        validar_sessao(self.token_class(attrs['refresh']))
        return super().validate(attrs)
