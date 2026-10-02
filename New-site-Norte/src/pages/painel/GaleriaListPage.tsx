import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { Album } from '../../data/painel/painelTypes'
import { deleteAlbum, despublicarAlbum, listAlbuns, publicarAlbum } from '../../services/painel/galeriaApi'
import { IconEdit, IconGallery, IconPublish, IconTrash, IconUnpublish } from '../../components/painel/icons'
import { ConfirmModal } from '../../components/painel/ConfirmModal'
import { PainelPageHeader } from '../../components/painel/PainelPageHeader'
import '../../styles/painel.css'

type ConfirmStatusAction = { album: Album; acao: 'publicar' | 'despublicar' }

export function GaleriaListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? '1')
  const queryClient = useQueryClient()
  const [confirmStatus, setConfirmStatus] = useState<ConfirmStatusAction | null>(null)
  const [confirmExcluir, setConfirmExcluir] = useState<Album | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['painel', 'albuns', page],
    queryFn: () => listAlbuns(page),
  })

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['painel', 'albuns'] })
  const erroGenerico = (acao: string) => () => toast.error(`Não foi possível ${acao}.`)
  const publicar = useMutation({
    mutationFn: (id: number) => publicarAlbum(id),
    onSuccess: () => {
      invalidar()
      toast.success('Álbum publicado com sucesso!')
    },
    onError: erroGenerico('publicar o álbum'),
  })
  const despublicar = useMutation({
    mutationFn: (id: number) => despublicarAlbum(id),
    onSuccess: () => {
      invalidar()
      toast.success('Álbum despublicado com sucesso!')
    },
    onError: erroGenerico('despublicar o álbum'),
  })
  const excluir = useMutation({
    mutationFn: (id: number) => deleteAlbum(id),
    onSuccess: () => {
      invalidar()
      toast.success('Álbum excluído com sucesso!')
    },
    onError: erroGenerico('excluir o álbum'),
  })

  function onExcluir(album: Album) {
    setConfirmExcluir(album)
  }

  function mudarPagina(delta: number) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page + delta))
    setSearchParams(next)
  }

  return (
    <div>
      <PainelPageHeader
        icon={<IconGallery />}
        title="Galeria"
        description="Veja e gerencie os álbuns de fotos publicados na galeria do site."
        actions={
          <Link to="/painel/galeria/novo" className="painel-primary-button">
            Novo álbum
          </Link>
        }
      />

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
                  <td className="painel-table-cell-thumb">
                    {album.capa ? (
                      <img className="painel-thumb" src={album.capa} alt="" />
                    ) : (
                      <div className="painel-thumb" />
                    )}
                  </td>
                  <td data-label="Título">{album.titulo}</td>
                  <td data-label="Data">
                    {album.data_evento ? new Date(album.data_evento).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td data-label="Fotos">{album.total_fotos}</td>
                  <td data-label="Status">
                    <span className={`painel-status-badge ${album.publicado ? 'publicado' : 'rascunho'}`}>
                      {album.publicado ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="painel-table-cell-actions">
                    <div className="painel-table-actions">
                      <Link to={`/painel/galeria/${album.id}`} data-tooltip="Gerenciar">
                        <IconEdit />
                        <span className="painel-sr-only">Gerenciar</span>
                      </Link>
                      {album.publicado ? (
                        <button
                          type="button"
                          data-tooltip="Despublicar"
                          onClick={() => setConfirmStatus({ album, acao: 'despublicar' })}
                        >
                          <IconUnpublish />
                          <span className="painel-sr-only">Despublicar</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          data-tooltip="Publicar"
                          onClick={() => setConfirmStatus({ album, acao: 'publicar' })}
                        >
                          <IconPublish />
                          <span className="painel-sr-only">Publicar</span>
                        </button>
                      )}
                      <button type="button" className="destrutivo" data-tooltip="Excluir" onClick={() => onExcluir(album)}>
                        <IconTrash />
                        <span className="painel-sr-only">Excluir</span>
                      </button>
                    </div>
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

      {confirmStatus && (
        <ConfirmModal
          title={confirmStatus.acao === 'publicar' ? 'Publicar álbum' : 'Despublicar álbum'}
          message={`Tem certeza que deseja ${
            confirmStatus.acao === 'publicar' ? 'publicar' : 'despublicar'
          } o álbum "${confirmStatus.album.titulo}"?`}
          confirmLabel={confirmStatus.acao === 'publicar' ? 'Publicar' : 'Despublicar'}
          variant={confirmStatus.acao === 'publicar' ? 'success' : 'warning'}
          isPending={publicar.isPending || despublicar.isPending}
          onCancel={() => setConfirmStatus(null)}
          onConfirm={() => {
            if (confirmStatus.acao === 'publicar') publicar.mutate(confirmStatus.album.id)
            else despublicar.mutate(confirmStatus.album.id)
            setConfirmStatus(null)
          }}
        />
      )}

      {confirmExcluir && (
        <ConfirmModal
          title="Excluir álbum"
          message={`Tem certeza que deseja excluir o álbum "${confirmExcluir.titulo}" e todas as suas fotos? Essa ação não pode ser desfeita.`}
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
