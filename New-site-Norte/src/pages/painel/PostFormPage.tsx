import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateJSON } from '@tiptap/html'
import type { JSONContent } from '@tiptap/core'
import { TipTapEditor } from '../../components/painel/TipTapEditor'
import { tiptapExtensions } from '../../tiptap/extensions'
import { estimateReadingTime } from '../../tiptap/readingTime'
import { slugify } from '../../data/painel/slugify'
import { POST_STATUS_OPTIONS } from '../../data/painel/postStatus'
import { listCategorias } from '../../services/painel/categoriasApi'
import { listAutores } from '../../services/painel/autoresApi'
import { createPost, getPost, updatePost, type PostInput } from '../../services/painel/postsApi'
import { PainelApiError } from '../../services/painel/httpClient'
import '../../styles/painel.css'

type FormValues = {
  titulo: string
  slug: string
  resumo: string
  autor: string
  categoria: string
  status: string
  data_publicacao: string
  tempo_leitura_minutos: string
  destaque: boolean
}

const FORM_DEFAULTS: FormValues = {
  titulo: '',
  slug: '',
  resumo: '',
  autor: '',
  categoria: '',
  status: 'rascunho',
  data_publicacao: '',
  tempo_leitura_minutos: '',
  destaque: false,
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function PostFormPage() {
  const { id } = useParams()
  const isEdicao = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: post, isLoading: carregandoPost } = useQuery({
    queryKey: ['painel', 'posts', id],
    queryFn: () => getPost(Number(id)),
    enabled: isEdicao,
  })

  const { data: categorias } = useQuery({ queryKey: ['painel', 'categorias'], queryFn: listCategorias })
  const { data: autores } = useQuery({ queryKey: ['painel', 'autores'], queryFn: listAutores })

  const [conteudoJson, setConteudoJson] = useState<JSONContent | null>(null)
  const [imagemCapaFile, setImagemCapaFile] = useState<File | null>(null)
  const [avisoConversao, setAvisoConversao] = useState(false)
  const [slugTocadoManualmente, setSlugTocadoManualmente] = useState(false)
  const [erroGeral, setErroGeral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: FORM_DEFAULTS })

  const titulo = watch('titulo')
  const status = watch('status')

  // Preenche o formulário quando os dados do post (modo edição) chegam.
  useEffect(() => {
    if (!post) return
    reset({
      titulo: post.titulo,
      slug: post.slug,
      resumo: post.resumo,
      autor: String(post.autor),
      categoria: post.categoria ? String(post.categoria) : '',
      status: post.status,
      data_publicacao: toDatetimeLocal(post.data_publicacao),
      tempo_leitura_minutos: post.tempo_leitura_minutos ? String(post.tempo_leitura_minutos) : '',
      destaque: post.destaque,
    })
    // Não regenerar o slug de um post já existente ao editar o título.
    setSlugTocadoManualmente(true)

    if (post.conteudo_json) {
      setConteudoJson(post.conteudo_json)
    } else if (post.conteudo) {
      setConteudoJson(generateJSON(post.conteudo, tiptapExtensions))
      setAvisoConversao(true)
    }
  }, [post, reset])

  // Slug automático a partir do título, só até o usuário editar o campo na mão.
  useEffect(() => {
    if (!slugTocadoManualmente) {
      setValue('slug', slugify(titulo || ''))
    }
  }, [titulo, slugTocadoManualmente, setValue])

  const estimativaLeitura = useMemo(() => estimateReadingTime(conteudoJson), [conteudoJson])

  const salvar = useMutation({
    mutationFn: async (data: FormValues) => {
      const input: PostInput = {
        titulo: data.titulo,
        slug: data.slug || undefined,
        resumo: data.resumo,
        conteudo_json: conteudoJson,
        autor: Number(data.autor),
        categoria: data.categoria ? Number(data.categoria) : null,
        destaque: data.destaque,
        status: data.status,
        data_publicacao: data.data_publicacao ? new Date(data.data_publicacao).toISOString() : null,
        tempo_leitura_minutos: data.tempo_leitura_minutos ? Number(data.tempo_leitura_minutos) : estimativaLeitura,
      }
      return isEdicao ? updatePost(Number(id), input, imagemCapaFile) : createPost(input, imagemCapaFile)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel', 'posts'] })
      navigate('/painel/posts')
    },
    onError: (error: unknown) => {
      if (error instanceof PainelApiError && error.body && typeof error.body === 'object') {
        const body = error.body as Record<string, string[]>
        let algumCampo = false
        for (const campo of ['titulo', 'slug', 'resumo', 'autor', 'categoria', 'status', 'data_publicacao'] as const) {
          if (body[campo]) {
            setError(campo, { message: body[campo].join(' ') })
            algumCampo = true
          }
        }
        if (!algumCampo) setErroGeral('Não foi possível salvar a postagem.')
      } else {
        setErroGeral('Não foi possível salvar a postagem.')
      }
    },
  })

  function onSubmit(data: FormValues) {
    setErroGeral(null)
    if (data.status === 'publicado' && !data.data_publicacao) {
      setError('data_publicacao', { message: 'Informe a data de publicação.' })
      return
    }
    salvar.mutate(data)
  }

  if (isEdicao && carregandoPost) return <p>Carregando…</p>

  return (
    <div>
      <div className="painel-crud-header">
        <h1>{isEdicao ? 'Editar postagem' : 'Nova postagem'}</h1>
      </div>

      <form className="painel-post-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="painel-form-grid">
          <label>
            Título
            <input autoFocus {...register('titulo', { required: true })} />
          </label>
          {errors.titulo && <span className="painel-field-error">Informe o título.</span>}

          <label>
            Slug
            <input {...register('slug')} onInput={() => setSlugTocadoManualmente(true)} />
          </label>
          {errors.slug && <span className="painel-field-error">{errors.slug.message}</span>}

          <label>
            Resumo
            <textarea rows={2} maxLength={300} {...register('resumo', { required: true })} />
          </label>
          {errors.resumo && <span className="painel-field-error">Informe o resumo.</span>}

          <label>
            Imagem de capa
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImagemCapaFile(event.target.files?.[0] ?? null)}
            />
          </label>
          {post?.imagem_capa && !imagemCapaFile && (
            <img className="painel-thumb" src={post.imagem_capa} alt="Capa atual" />
          )}

          <label>
            Autor
            <select {...register('autor', { required: true })}>
              <option value="">Selecione…</option>
              {autores?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
          </label>
          {errors.autor && <span className="painel-field-error">Selecione um autor.</span>}

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

          <label>
            Status
            <select {...register('status')}>
              {POST_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Data de publicação{status === 'publicado' ? '' : ' (opcional)'}
            <input type="datetime-local" {...register('data_publicacao')} />
          </label>
          {errors.data_publicacao && <span className="painel-field-error">{errors.data_publicacao.message}</span>}

          <label>
            Tempo de leitura (min){estimativaLeitura ? ` — estimado: ${estimativaLeitura}` : ''}
            <input type="number" min={1} {...register('tempo_leitura_minutos')} />
          </label>

          <label className="painel-checkbox">
            <input type="checkbox" {...register('destaque')} />
            Destaque na home
          </label>
        </div>

        {avisoConversao && (
          <p className="painel-form-warning">Conteúdo convertido do editor antigo — revise antes de salvar.</p>
        )}

        <label className="painel-editor-label">
          Conteúdo
          <TipTapEditor content={conteudoJson} onChange={setConteudoJson} />
        </label>

        {erroGeral && <p className="painel-form-error">{erroGeral}</p>}

        <div className="painel-form-actions">
          <button type="button" onClick={() => navigate('/painel/posts')}>
            Cancelar
          </button>
          <button type="submit" disabled={salvar.isPending}>
            {salvar.isPending ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
