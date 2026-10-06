import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Post } from '../../data/painel/painelTypes'
import { POST_STATUS_OPTIONS } from '../../data/painel/postStatus'
import { listCategorias } from '../../services/painel/categoriasApi'
import { listAutores } from '../../services/painel/autoresApi'
import { deletePost, despublicarPost, listPosts, publicarPost } from '../../services/painel/postsApi'
import { IconEdit, IconEye, IconPost, IconPublish, IconTrash, IconUnpublish } from '../../components/painel/icons'
import { ConfirmModal } from '../../components/painel/ConfirmModal'
import { PainelPageHeader } from '../../components/painel/PainelPageHeader'
import '../../styles/painel.css'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

type ConfirmStatusAction = { post: Post; acao: 'publicar' | 'despublicar' }

export function PostsListPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [confirmStatus, setConfirmStatus] = useState<ConfirmStatusAction | null>(null)
  const [confirmExcluir, setConfirmExcluir] = useState<Post | null>(null)
  const queryClient = useQueryClient()

  const titulo = searchParams.get('titulo') ?? ''
  const categoria = searchParams.get('categoria') ?? ''
  const autor = searchParams.get('autor') ?? ''
  const status = searchParams.get('status') ?? ''
  const page = Number(searchParams.get('page') ?? '1')

  const { data, isLoading } = useQuery({
    queryKey: ['painel', 'posts', { titulo, categoria, autor, status, page }],
    queryFn: () =>
      listPosts({
        titulo: titulo || undefined,
        categoria: categoria ? Number(categoria) : undefined,
        autor: autor ? Number(autor) : undefined,
        status: status || undefined,
        page,
      }),
  })

  const { data: categorias } = useQuery({ queryKey: ['painel', 'categorias'], queryFn: listCategorias })
  const { data: autores } = useQuery({ queryKey: ['painel', 'autores'], queryFn: listAutores, enabled: user?.tipo === 'gerente' })

  function atualizarFiltro(campo: string, valor: string) {
    const next = new URLSearchParams(searchParams)
    if (valor) next.set(campo, valor)
    else next.delete(campo)
    next.delete('page')
    setSearchParams(next)
  }

  function mudarPagina(delta: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page + delta))
    setSearchParams(next)
  }

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['painel', 'posts'] })
  const erroGenerico = (acao: string) => () => toast.error(`Não foi possível ${acao}.`)
  const publicar = useMutation({
    mutationFn: (id: number) => publicarPost(id),
    onSuccess: () => {
      invalidar()
      toast.success('Postagem publicada com sucesso!')
    },
    onError: erroGenerico('publicar a postagem'),
  })
  const despublicar = useMutation({
    mutationFn: (id: number) => despublicarPost(id),
    onSuccess: () => {
      invalidar()
      toast.success('Postagem tornada rascunho com sucesso!')
    },
    onError: erroGenerico('tornar a postagem rascunho'),
  })
  const excluir = useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: () => {
      invalidar()
      toast.success('Postagem excluída com sucesso!')
    },
    onError: erroGenerico('excluir a postagem'),
  })

  function onExcluir(post: Post) {
    setConfirmExcluir(post)
  }

  return (
    <div>
      <PainelPageHeader
        icon={<IconPost />}
        title="Postagens"
        description="Veja, filtre e gerencie as postagens do blog: publique, despublique ou exclua conteúdos."
        actions={
          <Link to="/painel/posts/novo" className="painel-primary-button">
            Nova postagem
          </Link>
        }
      />

      <div className="painel-filters">
        <input
          placeholder="Buscar por título…"
          defaultValue={titulo}
          onBlur={(event) => atualizarFiltro('titulo', event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') atualizarFiltro('titulo', (event.target as HTMLInputElement).value)
          }}
        />
        <select value={categoria} onChange={(event) => atualizarFiltro('categoria', event.target.value)}>
          <option value="">Todas as categorias</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        <select value={autor} onChange={(event) => atualizarFiltro('autor', event.target.value)}>
          <option value="">Todos os autores</option>
          {autores?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
        <select value={status} onChange={(event) => atualizarFiltro('status', event.target.value)}>
          <option value="">Todos os status</option>
          {POST_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p>Carregando…</p>}

      {data && (
        <>
          <table className="painel-table">
            <thead>
              <tr>
                <th aria-label="Capa" />
                <th>Título</th>
                <th>Categoria</th>
                <th>Autor</th>
                <th>Status</th>
                <th>Publicação</th>
                <th>Atualizado</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {data.results.map((post) => (
                <tr key={post.id}>
                  <td className="painel-table-cell-thumb">
                    {post.imagem_capa ? (
                      <img className="painel-thumb" src={post.imagem_capa} alt="" />
                    ) : (
                      <div className="painel-thumb" />
                    )}
                  </td>
                  <td data-label="Título">{post.titulo}</td>
                  <td data-label="Categoria">{post.categoria_nome ?? '—'}</td>
                  <td data-label="Autor">{post.autor_nome}</td>
                  <td data-label="Status">
                    <span className={`painel-status-badge ${post.status_efetivo}`}>{post.status_display}</span>
                  </td>
                  <td data-label="Publicação">
                    {post.data_publicacao ? new Date(post.data_publicacao).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td data-label="Atualizado">{new Date(post.data_atualizacao).toLocaleDateString('pt-BR')}</td>
                  <td className="painel-table-cell-actions">
                    <div className="painel-table-actions">
                      <Link to={`/painel/posts/${post.id}/editar`} data-tooltip="Editar">
                        <IconEdit />
                        <span className="painel-sr-only">Editar</span>
                      </Link>
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" data-tooltip="Visualizar">
                        <IconEye />
                        <span className="painel-sr-only">Visualizar</span>
                      </a>
                      {post.status === 'publicado' ? (
                        <button
                          type="button"
                          data-tooltip="Tornar rascunho"
                          onClick={() => setConfirmStatus({ post, acao: 'despublicar' })}
                        >
                          <IconUnpublish />
                          <span className="painel-sr-only">Tornar rascunho</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          data-tooltip="Publicar"
                          onClick={() => setConfirmStatus({ post, acao: 'publicar' })}
                        >
                          <IconPublish />
                          <span className="painel-sr-only">Publicar</span>
                        </button>
                      )}
                      <button type="button" className="destrutivo" data-tooltip="Excluir" onClick={() => onExcluir(post)}>
                        <IconTrash />
                        <span className="painel-sr-only">Excluir</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.results.length === 0 && (
                <tr>
                  <td colSpan={8} className="painel-empty">
                    Nenhuma postagem encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="painel-pagination">
            <button type="button" disabled={!data.previous} onClick={() => mudarPagina(-1)}>
              Anterior
            </button>
            <button type="button" disabled={!data.next} onClick={() => mudarPagina(1)}>
              Próxima
            </button>
          </div>
        </>
      )}

      {confirmStatus && (
        <ConfirmModal
          title={confirmStatus.acao === 'publicar' ? 'Publicar postagem' : 'Tornar rascunho'}
          message={`Tem certeza que deseja ${
            confirmStatus.acao === 'publicar' ? 'publicar' : 'tornar rascunho'
          } a postagem "${confirmStatus.post.titulo}"?`}
          confirmLabel={confirmStatus.acao === 'publicar' ? 'Publicar' : 'Tornar rascunho'}
          variant={confirmStatus.acao === 'publicar' ? 'success' : 'warning'}
          isPending={publicar.isPending || despublicar.isPending}
          onCancel={() => setConfirmStatus(null)}
          onConfirm={() => {
            if (confirmStatus.acao === 'publicar') publicar.mutate(confirmStatus.post.id)
            else despublicar.mutate(confirmStatus.post.id)
            setConfirmStatus(null)
          }}
        />
      )}

      {confirmExcluir && (
        <ConfirmModal
          title="Excluir postagem"
          message={`Tem certeza que deseja excluir a postagem "${confirmExcluir.titulo}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          variant="danger"
          isPending={excluir.isPending}
          onCancel={() => setConfirmExcluir(null)}
          onConfirm={() => {
            excluir.mutate(confirmExcluir.id)
            setConfirmExcluir(null)
          }}
        />
      )}
    </div>
  )
}
