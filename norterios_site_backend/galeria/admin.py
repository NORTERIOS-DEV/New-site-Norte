from django.contrib import admin, messages
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import path, reverse
from django.utils.html import format_html
from adminsortable2.admin import SortableAdminMixin, SortableInlineAdminMixin

from .models import Album, Categoria, Foto


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('nome',)}
    list_display = ('nome', 'slug')
    search_fields = ('nome',)


class FotoInline(SortableInlineAdminMixin, admin.TabularInline):
    model = Foto
    extra = 0
    fields = ('miniatura_preview', 'imagem', 'legenda', 'alt', 'ordem')
    readonly_fields = ('miniatura_preview', 'largura', 'altura')

    def miniatura_preview(self, obj):
        if obj.pk and obj.miniatura:
            return format_html(
                '<img src="{}" style="height:60px;border-radius:4px;object-fit:cover" />',
                obj.miniatura.url,
            )
        return '—'
    miniatura_preview.short_description = 'Preview'


@admin.register(Album)
class AlbumAdmin(SortableAdminMixin, admin.ModelAdmin):
    prepopulated_fields = {'slug': ('titulo',)}
    list_display = ('titulo', 'categoria', 'data_evento', 'publicado', 'total_fotos', 'ordem')
    list_filter = ('publicado', 'categoria')
    list_editable = ('publicado',)
    search_fields = ('titulo', 'descricao')
    readonly_fields = ('data_criacao', 'data_atualizacao', 'capa_preview', 'upload_lote_link')
    autocomplete_fields = ('categoria',)
    inlines = [FotoInline]

    def total_fotos(self, obj):
        return obj.fotos.count()
    total_fotos.short_description = 'Fotos'

    def capa_preview(self, obj):
        if obj.capa:
            return format_html(
                '<img src="{}" style="height:80px;border-radius:4px;object-fit:cover" />',
                obj.capa.url,
            )
        return 'Sem capa definida — a primeira foto do álbum será usada.'
    capa_preview.short_description = 'Preview da capa'

    def upload_lote_link(self, obj):
        if not obj.pk:
            return 'Salve o álbum antes de enviar várias fotos de uma vez.'
        url = reverse('admin:galeria_album_upload_fotos', args=[obj.pk])
        return format_html('<a href="{}" class="button">Adicionar várias fotos</a>', url)
    upload_lote_link.short_description = 'Upload em lote'

    def get_urls(self):
        custom_urls = [
            path(
                '<int:album_id>/upload-fotos/',
                self.admin_site.admin_view(self.upload_fotos_view),
                name='galeria_album_upload_fotos',
            ),
        ]
        return custom_urls + super().get_urls()

    def upload_fotos_view(self, request, album_id):
        album = get_object_or_404(Album, pk=album_id)

        if not request.user.has_perm('galeria.add_foto'):
            messages.error(request, 'Você não tem permissão para adicionar fotos.')
            return redirect(reverse('admin:galeria_album_change', args=[album.pk]))

        if request.method == 'POST':
            arquivos = request.FILES.getlist('fotos')
            if not arquivos:
                messages.warning(request, 'Nenhum arquivo selecionado.')
            else:
                proxima_ordem = (
                    album.fotos.order_by('-ordem').values_list('ordem', flat=True).first() or 0
                ) + 1
                criadas = 0
                erros = []
                for indice, arquivo in enumerate(arquivos):
                    try:
                        Foto.objects.create(
                            album=album, imagem=arquivo, ordem=proxima_ordem + indice,
                        )
                        criadas += 1
                    except Exception as exc:
                        erros.append(f'{arquivo.name}: {exc}')

                if criadas:
                    messages.success(request, f'{criadas} foto(s) adicionada(s) com sucesso.')
                for erro in erros:
                    messages.error(request, f'Falha ao processar {erro}')

            return redirect(reverse('admin:galeria_album_change', args=[album.pk]))

        context = {
            **self.admin_site.each_context(request),
            'album': album,
            'title': f'Adicionar várias fotos — {album.titulo}',
            'opts': self.model._meta,
        }
        return render(request, 'admin/galeria/bulk_upload.html', context)
