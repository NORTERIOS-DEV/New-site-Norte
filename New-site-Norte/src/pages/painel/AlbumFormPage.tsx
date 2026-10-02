import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { GalleryUploader } from '../../components/painel/GalleryUploader'
import { ImageDropInput } from '../../components/painel/ImageDropInput'
import { SortablePhotoGrid } from '../../components/painel/SortablePhotoGrid'
import {
  createAlbum,
  getAlbum,
  listGaleriaCategorias,
  updateAlbum,
  type AlbumInput,
} from '../../services/painel/galeriaApi'
import { PainelApiError } from '../../services/painel/httpClient'
import { IconArrowLeft, IconGallery } from '../../components/painel/icons'
import { PainelPageHeader } from '../../components/painel/PainelPageHeader'
import '../../styles/painel.css'

type FormValues = {
  titulo: string
  slug: string
  descricao: string
  data_evento: string
  categoria: string
  publicado: boolean
}

const FORM_DEFAULTS: FormValues = {
  titulo: '',
  slug: '',
  descricao: '',
  data_evento: '',
  categoria: '',
  publicado: false,
}

export function AlbumFormPage() {
  const { id } = useParams()
  const isEdicao = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: album, isLoading } = useQuery({
    queryKey: ['painel', 'albuns', id],
    queryFn: () => getAlbum(Number(id)),
    enabled: isEdicao,
  })
  const { data: categorias } = useQuery({
    queryKey: ['painel', 'galeria-categorias'],
    queryFn: listGaleriaCategorias,
  })

  const [capaFile, setCapaFile] = useState<File | null>(null)
  const [erroGeral, setErroGeral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: FORM_DEFAULTS })

  useEffect(() => {
    if (!album) return
    reset({
      titulo: album.titulo,
      slug: album.slug,
      descricao: album.descricao,
      data_evento: album.data_evento ?? '',
      categoria: album.categoria ? String(album.categoria) : '',
      publicado: album.publicado,
    })
  }, [album, reset])

  const salvar = useMutation({
    mutationFn: async (data: FormValues) => {
      const input: AlbumInput = {
        titulo: data.titulo,
        slug: data.slug || undefined,
        descricao: data.descricao,
        data_evento: data.data_evento || null,
        categoria: data.categoria ? Number(data.categoria) : null,
        publicado: data.publicado,
      }
      return isEdicao ? updateAlbum(Number(id), input, capaFile) : createAlbum(input, capaFile)
    },
    onSuccess: (novoAlbum) => {
      queryClient.invalidateQueries({ queryKey: ['painel', 'albuns'] })
      toast.success(isEdicao ? 'Álbum atualizado com sucesso!' : 'Álbum criado com sucesso!')
      if (!isEdicao) {
        navigate(`/painel/galeria/${novoAlbum.id}`, { replace: true })
      }
    },
    onError: (error: unknown) => {
      if (error instanceof PainelApiError && error.body && typeof error.body === 'object') {
        const body = error.body as Record<string, string[]>
        let algumCampo = false
        for (const campo of ['titulo', 'slug', 'descricao', 'data_evento', 'categoria'] as const) {
          if (body[campo]) {
            setError(campo, { message: body[campo].join(' ') })
            algumCampo = true
          }
        }
        if (!algumCampo) setErroGeral('Não foi possível salvar o álbum.')
      } else {
        setErroGeral('Não foi possível salvar o álbum.')
      }
      toast.error('Não foi possível salvar o álbum.')
    },
  })

  if (isEdicao && isLoading) return <p>Carregando…</p>

  return (
    <div>
      <PainelPageHeader
        icon={<IconGallery />}
        title={isEdicao ? 'Editar álbum' : 'Novo álbum'}
        description="Defina as informações do álbum e organize as fotos enviadas."
        actions={
          <button type="button" className="painel-back-button" onClick={() => navigate('/painel/galeria')}>
            <IconArrowLeft />
            Voltar
          </button>
        }
      />

      <form className="painel-post-form" onSubmit={handleSubmit((data) => salvar.mutate(data))} noValidate>
        <div className="painel-form-grid">
          <div className="painel-field">
            <label>
              Título
              <input autoFocus {...register('titulo', { required: true })} />
            </label>
            {errors.titulo && <span className="painel-field-error">Informe o título.</span>}
          </div>

          <div className="painel-field">
            <label>
              Slug (opcional)
              <input {...register('slug')} />
            </label>
            {errors.slug && <span className="painel-field-error">{errors.slug.message}</span>}
          </div>

          <label>
            Descrição
            <textarea className="painel-textarea-match-image" {...register('descricao')} />
          </label>

          <label>
            Imagem de capa
            <ImageDropInput file={capaFile} onFileChange={setCapaFile} existingImageUrl={album?.capa} />
          </label>

          <label>
            Data do evento
            <input type="date" {...register('data_evento')} />
          </label>

          <label>
            Categoria
            <select {...register('categoria')}>
              <option value="">Sem categoria</option>
              {categorias?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="painel-checkbox">
            <input type="checkbox" {...register('publicado')} />
            Publicado
          </label>
        </div>

        {erroGeral && <p className="painel-form-error">{erroGeral}</p>}

        <div className="painel-form-actions">
          <button type="submit" disabled={salvar.isPending}>
            {salvar.isPending ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>

      {isEdicao && album && (
        <div className="painel-gallery-fotos">
          <div className="painel-crud-header">
            <h2>Fotos</h2>
            <GalleryUploader albumId={album.id} />
          </div>
          <SortablePhotoGrid albumId={album.id} fotos={album.fotos} />
        </div>
      )}

      {!isEdicao && <p className="painel-empty">Salve o álbum para poder enviar fotos.</p>}
    </div>
  )
}
