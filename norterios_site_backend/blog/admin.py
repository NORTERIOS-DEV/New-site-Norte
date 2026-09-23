from django.contrib import admin

from .models import Categoria, Post


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('nome',)}
    list_display = ('nome', 'slug')
    search_fields = ('nome',)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('titulo',)}
    list_display = ('titulo', 'categoria', 'destaque', 'status', 'data_publicacao', 'autor')
    list_filter = ('status', 'categoria', 'destaque')
    list_editable = ('destaque',)
    search_fields = ('titulo', 'resumo')
    readonly_fields = ('data_criacao', 'data_atualizacao')
    autocomplete_fields = ('categoria',)

    def save_model(self, request, obj, form, change):
        if not obj.autor_id:
            obj.autor = request.user
        super().save_model(request, obj, form, change)
