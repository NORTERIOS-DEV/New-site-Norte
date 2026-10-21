import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateJSON } from '@tiptap/html'
import type { JSONContent } from '@tiptap/core'
import { TipTapEditor } from '../../components/painel/TipTapEditor'
import { ImageDropInput } from '../../components/painel/ImageDropInput'
import { PostPreviewModal } from '../../components/painel/PostPreviewModal'
import { tiptapExtensions } from '../../tiptap/extensions'
import { estimateReadingTime } from '../../tiptap/readingTime'
import { contemImagemSemAlt } from '../../tiptap/altCheck'
import { slugify } from '../../data/painel/slugify'
import { POST_STATUS_OPTIONS } from '../../data/painel/postStatus'
import { listCategorias } from '../../services/painel/categoriasApi'
import { listAutores } from '../../services/painel/autoresApi'
import { autosavePost, createPost, getPost, updatePost, type PostInput } from '../../services/painel/postsApi'
import { PainelApiError } from '../../services/painel/httpClient'
import { IconArrowLeft, IconPost } from '../../components/painel/icons'
import { PainelPageHeader } from '../../components/painel/PainelPageHeader'
import '../../styles/painel.css'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import type { Autor } from '../../data/painel/painelTypes'
import { painelFetchJson } from '../../services/painel/httpClient'

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
  meta_title: string
  meta_description: string
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
  meta_title: '',
  meta_description: '',
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function PostFormPage() {
  const { user } = useAuth()
  const isManager = user?.tipo === 'gerente'
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
  const { data: autores } = useQuery({ queryKey: ['painel', 'autores', user?.id], queryFn: () => isManager ? listAutores() : painelFetchJson<Autor>('/auth/me/autor/').then((autor) => [autor]) })

  const [conteudoJson, setConteudoJson] = useState<JSONContent | null>(null)
  const [imagemCapaFile, setImagemCapaFile] = useState<File | null>(null)
  const [ogImageFile, setOgImageFile] = useState<File | null>(null)
  const [avisoConversao, setAvisoConversao] = useState(false)
  const [slugTocadoManualmente, setSlugTocadoManualmente] = useState(false)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'salvando' | 'salvo' | 'erro'>('idle')
  const [ultimoSalvamento, setUltimoSalvamento] = useState<Date | null>(null)
  const [previewCapaUrl, setPreviewCapaUrl] = useState<string | null>(null)
  const [mostrarPreview, setMostrarPreview] = useState(false)
  const lastSavedSnapshotRef = useRef<string>('')
  const debounceAutosaveRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: FORM_DEFAULTS })

  useEffect(() => {
    if (!isManager && user?.autor) setValue('autor', String(user.autor))
  }, [isManager, user?.autor, setValue])

  const titulo = watch('titulo')
  const status = watch('status')
  const slug = watch('slug')
  const resumo = watch('resumo')
  const autorCampo = watch('autor')
  const categoriaCampo = watch('categoria')
  const destaqueCampo = watch('destaque')
  const tempoLeituraCampo = watch('tempo_leitura_minutos')
  const metaTitleCampo = watch('meta_title')
  const metaDescriptionCampo = watch('meta_description')

  // Snapshot usado tanto pelo autosave (decide se há mudança a salvar) quanto
  // pelo aviso de beforeunload - deliberadamente sem `status`/`data_publicacao`
  // (ver autosavePost em postsApi.ts: autosave nunca envia esses campos, então
  // não teria sentido o snapshot disparar uma re-gravação só por causa deles).
  function montarSnapshot(valores: {
    titulo: string
    slug: string
    resumo: string
    autor: string
    categoria: string
    destaque: boolean
    tempo_leitura_minutos: string
    meta_title: string
    meta_description: string
    conteudoJson: JSONContent | null
  }) {
    return JSON.stringify(valores)
  }

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
      meta_title: post.meta_title,
      meta_description: post.meta_description,
    })
    // Não regenerar o slug de um post já existente ao editar o título.
    setSlugTocadoManualmente(true)

    let conteudoInicial: JSONContent | null = null
    if (post.conteudo_json) {
      conteudoInicial = post.conteudo_json
      setConteudoJson(conteudoInicial)
    } else if (post.conteudo) {
      conteudoInicial = generateJSON(post.conteudo, tiptapExtensions)
      setConteudoJson(conteudoInicial)
      setAvisoConversao(true)
    }

    // Baseline do autosave/beforeunload: evita que o próprio carregamento do
    // post seja interpretado como "alteração não salva".
    lastSavedSnapshotRef.current = montarSnapshot({
      titulo: post.titulo,
      slug: post.slug,
      resumo: post.resumo,
      autor: String(post.autor),
      categoria: post.categoria ? String(post.categoria) : '',
      destaque: post.destaque,
      tempo_leitura_minutos: post.tempo_leitura_minutos ? String(post.tempo_leitura_minutos) : '',
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      conteudoJson: conteudoInicial,
    })
  }, [post, reset])

  // Slug automático a partir do título, só até o usuário editar o campo na mão.
  useEffect(() => {
    if (!slugTocadoManualmente) {
      setValue('slug', slugify(titulo || ''))
    }
  }, [titulo, slugTocadoManualmente, setValue])

  const estimativaLeitura = useMemo(() => estimateReadingTime(conteudoJson), [conteudoJson])

  const autosave = useMutation({
    mutationFn: async (vars: { snapshot: string; input: PostInput }) =>
      autosavePost(Number(id), vars.input, { imagemCapa: imagemCapaFile, ogImage: ogImageFile }),
    onMutate: () => setAutosaveStatus('salvando'),
    onSuccess: (_post, vars) => {
      lastSavedSnapshotRef.current = vars.snapshot
      setAutosaveStatus('salvo')
      setUltimoSalvamento(new Date())
      queryClient.invalidateQueries({ queryKey: ['painel', 'posts'] })
    },
    onError: () => setAutosaveStatus('erro'),
  })

  // Autosave do rascunho: só em modo edição (criar do zero ainda exige o
  // primeiro "Salvar" manual para o post existir e poder ser atualizado via
  // PATCH) - debounce de ~2.5s após a última alteração em qualquer campo
  // relevante ou no conteúdo do editor.
  useEffect(() => {
    if (!isEdicao || !post) return
    const snapshot = montarSnapshot({
      titulo,
      slug,
      resumo,
      autor: autorCampo,
      categoria: categoriaCampo,
      destaque: destaqueCampo,
      tempo_leitura_minutos: tempoLeituraCampo,
      meta_title: metaTitleCampo,
      meta_description: metaDescriptionCampo,
      conteudoJson,
    })
    if (snapshot === lastSavedSnapshotRef.current) return

    if (debounceAutosaveRef.current) clearTimeout(debounceAutosaveRef.current)
    debounceAutosaveRef.current = setTimeout(() => {
      if (autosave.isPending) return
      const input: PostInput = {
        titulo,
        slug: slug || undefined,
        resumo,
        conteudo_json: conteudoJson,
        autor: isManager ? Number(autorCampo) : undefined,
        categoria: categoriaCampo ? Number(categoriaCampo) : null,
        destaque: isManager ? destaqueCampo : undefined,
        status,
        tempo_leitura_minutos: tempoLeituraCampo ? Number(tempoLeituraCampo) : estimativaLeitura,
        meta_title: metaTitleCampo,
        meta_description: metaDescriptionCampo,
      }
      autosave.mutate({ snapshot, input })
    }, 2500)

    return () => {
      if (debounceAutosaveRef.current) clearTimeout(debounceAutosaveRef.current)
    }
    // `autosave`/`status`/`estimativaLeitura` ficam de fora de propósito: não devem reiniciar o debounce.
  }, [
    isEdicao,
    post,
    titulo,
    slug,
    resumo,
    autorCampo,
    categoriaCampo,
    destaqueCampo,
    tempoLeituraCampo,
    metaTitleCampo,
    metaDescriptionCampo,
    conteudoJson,
  ])

  // Aviso do navegador ao sair com alterações não salvas (vale tanto pra
  // criação quanto edição: `lastSavedSnapshotRef` começa vazio, então digitar
  // em um post novo já conta como alteração não salva).
  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      const snapshot = montarSnapshot({
        titulo,
        slug,
        resumo,
        autor: autorCampo,
        categoria: categoriaCampo,
        destaque: destaqueCampo,
        tempo_leitura_minutos: tempoLeituraCampo,
        meta_title: metaTitleCampo,
        meta_description: metaDescriptionCampo,
        conteudoJson,
      })
      if (snapshot !== lastSavedSnapshotRef.current) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [
    titulo,
    slug,
    resumo,
    autorCampo,
    categoriaCampo,
    destaqueCampo,
    tempoLeituraCampo,
    metaTitleCampo,
    metaDescriptionCampo,
    conteudoJson,
  ])

  const salvar = useMutation({
    mutationFn: async (data: FormValues) => {
      const input: PostInput = {
        titulo: data.titulo,
        slug: data.slug || undefined,
        resumo: data.resumo,
        conteudo_json: conteudoJson,
        autor: isManager ? Number(data.autor) : undefined,
        categoria: data.categoria ? Number(data.categoria) : null,
        destaque: isManager ? data.destaque : undefined,
        status: data.status,
        data_publicacao: data.data_publicacao ? new Date(data.data_publicacao).toISOString() : null,
        tempo_leitura_minutos: data.tempo_leitura_minutos ? Number(data.tempo_leitura_minutos) : estimativaLeitura,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
      }
      const arquivos = { imagemCapa: imagemCapaFile, ogImage: ogImageFile }
      return isEdicao ? updatePost(Number(id), input, arquivos) : createPost(input, arquivos)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['painel', 'posts'] })
      toast.success(isEdicao ? 'Postagem atualizada com sucesso!' : 'Postagem criada com sucesso!')
      navigate('/painel/posts')
    },
    onError: (error: unknown) => {
      if (error instanceof PainelApiError && error.body && typeof error.body === 'object') {
        const body = error.body as Record<string, string[]>
        let algumCampo = false
        for (const campo of [
          'titulo',
          'slug',
          'resumo',
          'autor',
          'categoria',
          'status',
          'data_publicacao',
          'meta_title',
          'meta_description',
        ] as const) {
          if (body[campo]) {
            setError(campo, { message: body[campo].join(' ') })
            algumCampo = true
          }
        }
        // `imagem_capa`/`conteudo_json` não são campos do form (capa é um File à
        // parte, conteúdo é o editor) - mostra como erro geral em vez de setError.
        if (!algumCampo && (body.imagem_capa || body.conteudo_json)) {
          setErroGeral((body.imagem_capa ?? body.conteudo_json).join(' '))
          algumCampo = true
        }
        if (!algumCampo) setErroGeral('Não foi possível salvar a postagem.')
      } else {
        setErroGeral('Não foi possível salvar a postagem.')
      }
      toast.error('Não foi possível salvar a postagem.')
    },
  })

  function onSubmit(data: FormValues) {
    setErroGeral(null)

    const vaiPublicar = data.status === 'publicado' || data.status === 'agendado'

    if (vaiPublicar && !data.data_publicacao) {
      setError('data_publicacao', { message: 'Informe a data de publicação.' })
      return
    }
    if (data.status === 'agendado' && new Date(data.data_publicacao) <= new Date()) {
      setError('data_publicacao', { message: 'Informe uma data futura para agendar.' })
      return
    }

    // Validação client-side de publish-readiness - espelha blog/serializers_painel.py
    // (decisão: dar feedback imediato aqui, mas o backend continua sendo a
    // fonte de verdade e reaplica a mesma checagem).
    if (vaiPublicar) {
      const temCapa = Boolean(imagemCapaFile || post?.imagem_capa)
      if (!temCapa) {
        setErroGeral('A imagem de capa é obrigatória para publicar.')
        return
      }
      if (contemImagemSemAlt(conteudoJson)) {
        setErroGeral('Todas as imagens do conteúdo precisam de texto alternativo antes de publicar.')
        return
      }
    }

    salvar.mutate(data)
  }

  function abrirPreview() {
    setPreviewCapaUrl(imagemCapaFile ? URL.createObjectURL(imagemCapaFile) : null)
    setMostrarPreview(true)
  }

  function fecharPreview() {
    if (previewCapaUrl) URL.revokeObjectURL(previewCapaUrl)
    setPreviewCapaUrl(null)
    setMostrarPreview(false)
  }

  if (isEdicao && carregandoPost) return <p>Carregando…</p>

  return (
    <div>
      <PainelPageHeader
        icon={<IconPost />}
        title={isEdicao ? 'Editar postagem' : 'Nova postagem'}
        description="Escreva o conteúdo da postagem e defina capa, categoria, autor e status de publicação."
        actions={
          <button type="button" className="painel-back-button" onClick={() => navigate('/painel/posts')}>
            <IconArrowLeft />
            Voltar
          </button>
        }
      />

      {isEdicao && autosaveStatus !== 'idle' && (
        <p className="painel-autosave-status" data-status={autosaveStatus}>
          {autosaveStatus === 'salvando' && 'Salvando…'}
          {autosaveStatus === 'salvo' &&
            ultimoSalvamento &&
            `Salvo às ${ultimoSalvamento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
          {autosaveStatus === 'erro' && 'Erro ao salvar as últimas alterações — tentando novamente'}
        </p>
      )}

      <form className="painel-post-form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
              Slug
              <input {...register('slug')} onInput={() => setSlugTocadoManualmente(true)} />
              <small className="painel-field-hint">
                Gerado automaticamente a partir do título. Edite se quiser definir um slug personalizado.
              </small>
            </label>
            {errors.slug && <span className="painel-field-error">{errors.slug.message}</span>}
          </div>

          <div className="painel-field">
            <label>
              Resumo
              <textarea
                className="painel-textarea-match-image"
                maxLength={300}
                {...register('resumo', { required: true })}
              />
            </label>
            {errors.resumo && <span className="painel-field-error">Informe o resumo.</span>}
          </div>

          <label>
            Imagem de capa
            <ImageDropInput file={imagemCapaFile} onFileChange={setImagemCapaFile} existingImageUrl={post?.imagem_capa} />
          </label>

          <div className="painel-field">
            <label>
              Autor
              <select disabled={!isManager} {...register('autor', { required: isManager })}>
                <option value="">Selecione…</option>
                {autores?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </label>
            {errors.autor && <span className="painel-field-error">Selecione um autor.</span>}
          </div>

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

          <div className="painel-field">
            <label>
              Data de publicação{status === 'publicado' || status === 'agendado' ? '' : ' (opcional)'}
              <input type="datetime-local" {...register('data_publicacao')} />
            </label>
            {errors.data_publicacao && <span className="painel-field-error">{errors.data_publicacao.message}</span>}
          </div>

          <label>
            Tempo de leitura (min){estimativaLeitura ? ` — estimado: ${estimativaLeitura}` : ''}
            <input type="number" min={1} {...register('tempo_leitura_minutos')} />
          </label>

          {isManager && <div className="painel-field">
            <label className="painel-checkbox">
              <input type="checkbox" {...register('destaque')} />
              Destaque na home
            </label>
            <small className="painel-field-hint">Selecione até 3 posts em destaque. O mais recente aparece maior, acima dos outros dois.</small>
          </div>}
        </div>

        <h3 className="painel-form-section-title">SEO e compartilhamento</h3>
        <div className="painel-form-grid">
          <div className="painel-field">
            <label>
              Meta title
              <input maxLength={70} placeholder={titulo || 'Usa o título da postagem'} {...register('meta_title')} />
              <small className="painel-field-hint">{metaTitleCampo?.length ?? 0}/70 — se vazio, usa o título.</small>
            </label>
          </div>

          <div className="painel-field">
            <label>
              Meta description
              <textarea
                rows={3}
                maxLength={160}
                placeholder={resumo || 'Usa o resumo da postagem'}
                {...register('meta_description')}
              />
              <small className="painel-field-hint">{metaDescriptionCampo?.length ?? 0}/160 — se vazio, usa o resumo.</small>
            </label>
          </div>

          <label>
            Imagem para compartilhamento (Open Graph)
            <ImageDropInput file={ogImageFile} onFileChange={setOgImageFile} existingImageUrl={post?.og_image} />
            <small className="painel-field-hint">Se vazia, usa a imagem de capa.</small>
          </label>
        </div>

        {avisoConversao && (
          <p className="painel-form-warning">Conteúdo convertido do editor antigo — revise antes de salvar.</p>
        )}

        {/* Não é um <label>: um <label> sem `htmlFor` delega cliques em
            conteúdo não-interativo (o texto digitado no editor) pro primeiro
            elemento "labelable" dentro dele - como a toolbar tem vários
            <button>, isso fazia qualquer clique no corpo do editor acionar
            silenciosamente o primeiro botão de título (H2), convertendo o
            parágrafo clicado em heading. */}
        <div className="painel-editor-label">
          <span>Conteúdo</span>
          <TipTapEditor content={conteudoJson} onChange={setConteudoJson} />
        </div>

        {erroGeral && <p className="painel-form-error">{erroGeral}</p>}

        <div className="painel-form-actions">
          <button type="button" onClick={() => navigate('/painel/posts')}>
            Cancelar
          </button>
          <button type="button" onClick={abrirPreview}>
            Pré-visualizar
          </button>
          <button type="submit" disabled={salvar.isPending}>
            {salvar.isPending ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>

      {mostrarPreview &&
        createPortal(
          <PostPreviewModal
            titulo={titulo}
            resumo={resumo}
            imagemCapaUrl={previewCapaUrl ?? post?.imagem_capa ?? null}
            categoriaNome={categorias?.find((c) => String(c.id) === categoriaCampo)?.nome ?? null}
            autorNome={autores?.find((a) => String(a.id) === autorCampo)?.nome ?? null}
            conteudoJson={conteudoJson}
            onClose={fecharPreview}
          />,
          document.body,
        )}
    </div>
  )
}
