import re
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers
from blog.models import Autor
from .models import Perfil, perfil_usuario


class UserSerializer(serializers.ModelSerializer):
    nome_completo = serializers.CharField(source='perfil.nome_completo', max_length=150)
    telefone = serializers.CharField(source='perfil.telefone', max_length=30)
    cargo = serializers.CharField(source='perfil.cargo', max_length=120)
    tipo = serializers.ChoiceField(source='perfil.tipo', choices=['gerente', 'autor', 'comum'])
    autor = serializers.IntegerField(source='perfil.autor_id', read_only=True)
    password = serializers.CharField(write_only=True, required=False, trim_whitespace=False)
    email = serializers.EmailField(required=True, allow_blank=False)
    is_active = serializers.BooleanField(default=True)
    groups = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'nome_completo', 'telefone', 'cargo', 'tipo', 'is_active', 'autor', 'password', 'first_name', 'last_name', 'groups', 'permissions']
        read_only_fields = ['first_name', 'last_name']

    def get_groups(self, obj):
        return list(obj.groups.values_list('name', flat=True))

    def get_permissions(self, obj):
        tipo = perfil_usuario(obj).tipo
        models = ['blog.post', 'blog.categoria', 'blog.autor', 'galeria.album', 'galeria.categoria', 'galeria.foto'] if tipo == 'gerente' else (['blog.post'] if tipo == 'autor' else [])
        return [f'{app}.{action}_{model}' for item in models for app, model in [item.split('.')] for action in ['view', 'add', 'change', 'delete']]

    def validate_telefone(self, value):
        if not re.fullmatch(r'[\d\s()+.\-]+', value) or len(re.sub(r'\D', '', value)) not in (10, 11):
            raise serializers.ValidationError('Informe telefone com DDD (10 ou 11 dígitos).')
        return value

    def validate(self, attrs):
        for field in ['username', 'email']:
            if field in attrs and User.objects.filter(**{f'{field}__iexact': attrs[field]}).exclude(pk=getattr(self.instance, 'pk', None)).exists():
                raise serializers.ValidationError({field: 'Já existe uma conta com este valor.'})
        if not self.instance and 'password' not in attrs:
            raise serializers.ValidationError({'password': 'Informe a senha inicial.'})
        if 'password' in attrs:
            candidate = User(username=attrs.get('username', getattr(self.instance, 'username', '')), email=attrs.get('email', getattr(self.instance, 'email', '')))
            try:
                validate_password(attrs['password'], candidate)
            except DjangoValidationError as exc:
                raise serializers.ValidationError({'password': exc.messages})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        profile_data = validated_data.pop('perfil')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        self.save_profile(user, profile_data)
        return user

    @transaction.atomic
    def update(self, instance, validated_data):
        Perfil.objects.select_for_update().get(user=instance)
        profile_data = validated_data.pop('perfil', {})
        password = validated_data.pop('password', None)
        old_active = instance.is_active
        instance = super().update(instance, validated_data)
        perfil = self.save_profile(instance, profile_data)
        if password is not None:
            instance.set_password(password)
            instance.save(update_fields=['password'])
        if password is not None or old_active != instance.is_active:
            perfil.versao_sessao += 1
            perfil.save(update_fields=['versao_sessao'])
        return instance

    def save_profile(self, user, data):
        perfil = perfil_usuario(user)
        for key, value in data.items():
            setattr(perfil, key, value)
        if perfil.tipo == 'autor' and not perfil.autor_id:
            perfil.autor = Autor.objects.create(nome=perfil.nome_completo, cargo=perfil.cargo)
        perfil.save()
        if perfil.autor_id:
            Autor.objects.filter(pk=perfil.autor_id).update(nome=perfil.nome_completo, cargo=perfil.cargo)
        return perfil


class MeSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        read_only_fields = ['username', 'cargo', 'tipo', 'is_active', 'first_name', 'last_name', 'password']

    def validate(self, attrs):
        forbidden = set(self.initial_data) - {'nome_completo', 'email', 'telefone'}
        if forbidden:
            raise serializers.ValidationError({key: 'Campo não permitido.' for key in forbidden})
        return super().validate(attrs)


class PasswordSerializer(serializers.Serializer):
    password = serializers.CharField(trim_whitespace=False)
    senha_atual = serializers.CharField(required=False, trim_whitespace=False)

    def validate(self, attrs):
        user = self.context['user']
        if self.context.get('self') and not user.check_password(attrs.get('senha_atual', '')):
            raise serializers.ValidationError({'senha_atual': 'Senha atual incorreta.'})
        try:
            validate_password(attrs['password'], user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': exc.messages})
        return attrs
