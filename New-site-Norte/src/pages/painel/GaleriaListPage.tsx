import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Album } from '../../data/painel/painelTypes'
import { deleteAlbum, despublicarAlbum, listAlbuns, publicarAlbum } from '../../services/painel/galeriaApi'
import '../../styles/painel.css'

export function GaleriaListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? '1')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['painel', 'albuns', page],
    queryFn: () => listAlbuns(page),
  })

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['painel', 'albuns'] })
  const publicar = useMutation({ mutationFn: (id: number) => publicarAlbum(id), onSuccess: invalidar })
  const despublicar = useMutation({ mutationFn: (id: number) => despublicarAlbum(id), onSuccess: invalidar })
  const excluir = useMutation({ mutationFn: (id: number) => deleteAlbum(id), onSuccess: invalidar })

  function onExcluir(album: Album) {
    if (window.confirm(`Excluir o álbum "${album.titulo}" e todas as suas fotos?`)) {
      excluir.mutate(album.id)
    }
  }

  function mudarPagina(delta: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page + delta))
    setSearchParams(next)
  }

  return (
    <div>
      <div className="painel-crud-header">
        <h1>Galeria</h1>
        <Link to="/painel/galeria/novo" className="painel-primary-button">
          Novo álbum
        </Link>
      </div>

      {isLoading && <p>Carregando…</p>}

      {data && (
        <>
          <table className="painel-table">
            <thead>
              <tr>
                <th aria-label="Capa" />
                <th>Título</th>
                <th>Data</th>
                <th>Fotos</th>
                <th>Status</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {data.results.map((album) => (
                <tr key={album.id}>
                  <td>
                    {album.capa ? (
                      <img className="painel-thumb" src={album.capa} alt="" />
                    ) : (
                      <div className="painel-thumb" />
                    )}
                  </td>
                  <td>{album.titulo}</td>
                  <td>{album.data_evento ? new Date(album.data_evento).toLocaleDateString('pt-BR') : '—'}</td>
                  <td>{album.total_fotos}</td>
                  <td>
                    <span className={`painel-status-badge ${album.publicado ? 'publicado' : 'rascunho'}`}>
                      {album.publicado ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="painel-table-actions">
                    <Link to={`/painel/galeria/${album.id}`}>Gerenciar</Link>
                    {album.publicado ? (
                      <button type="button" onClick={() => despublicar.mutate(album.id)}>
                        Despublicar
                      </button>
                    ) : (
                      <button type="button" onClick={() => publicar.mutate(album.id)}>
                        Publicar
                      </button>
                    )}
                    <button type="button" className="destrutivo" onClick={() => onExcluir(album)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {data.results.length === 0 && (
                <tr>
                  <td colSpan={6} className="painel-empty">
                    Nenhum álbum cadastrado ainda.
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
