import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCategoria } from '../../services/painel/categoriasApi'
import { listPosts } from '../../services/painel/postsApi'
import { IconArrowLeft, IconEdit, IconEye, IconTag } from '../../components/painel/icons'
import { PainelPageHeader } from '../../components/painel/PainelPageHeader'
import '../../styles/painel.css'

export function CategoriaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? '1')
  const categoriaId = Number(id)

  const { data: categoria, isLoading } = useQuery({
    queryKey: ['painel', 'categorias', categoriaId],
    queryFn: () => getCategoria(categoriaId),
  })

  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['painel', 'posts', { categoria: categoriaId, page }],
    queryFn: () => listPosts({ categoria: categoriaId, page }),
    enabled: Number.isFinite(categoriaId),
  })

  function mudarPagina(delta: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page + delta))
    setSearchParams(next)
  }

  if (isLoading) return <p>Carregando…</p>
  if (!categoria) return <p>Categoria não encontrada.</p>

  return (
    <div>
      <PainelPageHeader
        icon={<IconTag />}
        title={categoria.nome}
        description="Confira os dados da categoria e as postagens vinculadas a ela."
        actions={
          <button type="button" className="painel-back-button" onClick={() => navigate('/painel/categorias')}>
            <IconArrowLeft />
            Voltar
          </button>
        }
      />

      <div className="painel-post-form">
        <div className="painel-autor-profile-header">
          <h2>{categoria.nome}</h2>
          <span className={`painel-status-badge ${categoria.ativo ? 'publicado' : 'rascunho'}`}>
            {categoria.ativo ? 'Ativa' : 'Inativa'}
          </span>
        </div>

        <p className="painel-autor-profile-handle">Slug: {categoria.slug}</p>

        <p className="painel-autor-profile-bio">{categoria.descricao || 'Sem descrição cadastrada.'}</p>

        {posts && (
          <span className="painel-categoria-profile-stat">
            {posts.count} {posts.count === 1 ? 'postagem' : 'postagens'}
          </span>
        )}
      </div>

      <div className="painel-gallery-fotos">
        <div className="painel-crud-header">
          <h2>Postagens desta categoria</h2>
        </div>

        {isLoadingPosts && <p>Carregando…</p>}

        {posts && (
          <>
            <table className="painel-table">
              <thead>
                <tr>
                  <th aria-label="Capa" />
                  <th>Título</th>
                  <th>Autor</th>
                  <th>Status</th>
                  <th>Publicação</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {posts.results.map((post) => (
                  <tr key={post.id}>
                    <td className="painel-table-cell-thumb">
                      {post.imagem_capa ? (
                        <img className="painel-thumb" src={post.imagem_capa} alt="" />
                      ) : (
                        <div className="painel-thumb" />
                      )}
                    </td>
                    <td data-label="Título">{post.titulo}</td>
                    <td data-label="Autor">{post.autor_nome}</td>
                    <td data-label="Status">
                      <span className={`painel-status-badge ${post.status_efetivo}`}>{post.status_display}</span>
                    </td>
                    <td data-label="Publicação">
                      {post.data_publicacao ? new Date(post.data_publicacao).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="painel-table-cell-actions">
                      <div className="painel-table-actions">
                        <Link to={`/painel/posts/${post.id}/editar`} data-tooltip="Editar">
                          <IconEdit />
                          <span className="painel-sr-only">Editar</span>
                        </Link>
                        {post.status_efetivo === 'publicado' && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            data-tooltip="Visualizar"
                          >
                            <IconEye />
                            <span className="painel-sr-only">Visualizar</span>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.results.length === 0 && (
                  <tr>
                    <td colSpan={6} className="painel-empty">
                      Nenhuma postagem vinculada a esta categoria ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="painel-pagination">
              <button type="button" disabled={!posts.previous} onClick={() => mudarPagina(-1)}>
                Anterior
              </button>
              <button type="button" disabled={!posts.next} onClick={() => mudarPagina(1)}>
                Próxima
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
