import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Post } from '../../data/painel/painelTypes'
import { POST_STATUS_OPTIONS } from '../../data/painel/postStatus'
import { listCategorias } from '../../services/painel/categoriasApi'
import { listAutores } from '../../services/painel/autoresApi'
import { deletePost, despublicarPost, listPosts, publicarPost } from '../../services/painel/postsApi'
import '../../styles/painel.css'

export function PostsListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
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
  const { data: autores } = useQuery({ queryKey: ['painel', 'autores'], queryFn: listAutores })

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
  const publicar = useMutation({ mutationFn: (id: number) => publicarPost(id), onSuccess: invalidar })
  const despublicar = useMutation({ mutationFn: (id: number) => despublicarPost(id), onSuccess: invalidar })
  const excluir = useMutation({ mutationFn: (id: number) => deletePost(id), onSuccess: invalidar })

  function onExcluir(post: Post) {
    if (window.confirm(`Excluir a postagem "${post.titulo}"?`)) {
      excluir.mutate(post.id)
    }
  }

  return (
    <div>
      <div className="painel-crud-header">
        <h1>Postagens</h1>
        <Link to="/painel/posts/novo" className="painel-primary-button">
          Nova postagem
        </Link>
      </div>

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
                  <td>
                    {post.imagem_capa ? (
                      <img className="painel-thumb" src={post.imagem_capa} alt="" />
                    ) : (
                      <div className="painel-thumb" />
                    )}
                  </td>
                  <td>{post.titulo}</td>
                  <td>{post.categoria_nome ?? '—'}</td>
                  <td>{post.autor_nome}</td>
                  <td>
                    <span className={`painel-status-badge ${post.status}`}>{post.status_display}</span>
                  </td>
                  <td>{post.data_publicacao ? new Date(post.data_publicacao).toLocaleDateString('pt-BR') : '—'}</td>
                  <td>{new Date(post.data_atualizacao).toLocaleDateString('pt-BR')}</td>
                  <td className="painel-table-actions">
                    <Link to={`/painel/posts/${post.id}/editar`}>Editar</Link>
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                      Visualizar
                    </a>
                    {post.status === 'publicado' ? (
                      <button type="button" onClick={() => despublicar.mutate(post.id)}>
                        Tornar rascunho
                      </button>
                    ) : (
                      <button type="button" onClick={() => publicar.mutate(post.id)}>
                        Publicar
                      </button>
                    )}
                    <button type="button" className="destrutivo" onClick={() => onExcluir(post)}>
                      Excluir
                    </button>
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
    </div>
  )
}
