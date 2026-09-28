import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Reveal } from '../components/Reveal'
import { GaleriaLightbox } from '../components/GaleriaLightbox'
import { NotFoundPage } from './NotFoundPage'
import { getAlbumBySlug, getAlbumFotos } from '../services/galeriaApi'
import type { AlbumDetail, Foto } from '../data/galeriaTypes'
import '../styles/galeria.css'

function formatDate(iso: string): string {
  // Data sem horário (YYYY-MM-DD): montar a data em horário local para não
  // sofrer o deslocamento de um dia que `new Date(iso)` causa (interpreta
  // como meia-noite UTC) em fusos horários atrás de UTC, como o do Brasil.
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function GaleriaAlbumPage() {
  const { slug } = useParams()

  const [album, setAlbum] = useState<AlbumDetail | null | undefined>(undefined)
  const [error, setError] = useState(false)

  const [fotos, setFotos] = useState<Foto[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setAlbum(undefined)
    setError(false)
    setFotos([])
    setPage(1)
    setHasMore(false)

    getAlbumBySlug(slug ?? '')
      .then((result) => {
        if (cancelled) return
        setAlbum(result)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (!album || !slug) return
    let cancelled = false

    getAlbumFotos(slug, 1)
      .then((result) => {
        if (cancelled) return
        setFotos(result.results)
        setHasMore(Boolean(result.next))
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [album, slug])

  function loadMore() {
    if (!slug || loadingMore) return
    const nextPage = page + 1
    setLoadingMore(true)
    getAlbumFotos(slug, nextPage)
      .then((result) => {
        setFotos((prev) => [...prev, ...result.results])
        setHasMore(Boolean(result.next))
        setPage(nextPage)
      })
      .catch(() => setError(true))
      .finally(() => setLoadingMore(false))
  }

  if (error) {
    return (
      <section className="sec galeria-sec">
        <div className="wrap">
          <p className="galeria-state">
            Não foi possível carregar este álbum no momento. Tente novamente em
            instantes.
          </p>
        </div>
      </section>
    )
  }

  if (album === undefined) {
    return (
      <section className="sec galeria-sec">
        <div className="wrap">
          <p className="galeria-state">Carregando álbum…</p>
        </div>
      </section>
    )
  }

  if (album === null) return <NotFoundPage />

  return (
    <>
      <Seo
        title={`${album.titulo} · Galeria · Norte Rios`}
        description={album.descricao || `Fotos do álbum ${album.titulo}.`}
      />

      <section className="sec galeria-sec" aria-label={album.titulo}>
        <div className="wrap galeria-album-wrap">
          <Reveal className="galeria-album-head">
            <Link to="/galeria" className="eyebrow" style={{ cursor: 'pointer' }}>
              ← Galeria
            </Link>
            <h2 style={{ fontSize: 'clamp(1.7rem,3.6vw,2.6rem)', marginTop: 16 }}>
              {album.titulo}
            </h2>
            <p className="lead" style={{ marginTop: 12 }}>
              {album.descricao || 'Confira as fotos deste álbum da galeria Norte Rios.'}
            </p>
            <p className="pdates">
              {album.data_evento && (
                <>
                  {formatDate(album.data_evento)}
                  <span className="sep">·</span>
                </>
              )}
              {album.total_fotos} {album.total_fotos === 1 ? 'foto' : 'fotos'}
            </p>
          </Reveal>

          {fotos.length === 0 ? (
            <p className="galeria-state">Este álbum ainda não tem fotos.</p>
          ) : (
            <>
              <div className="galeria-fotos-grid">
                {fotos.map((foto, i) => (
                  <button
                    type="button"
                    key={foto.id}
                    className="galeria-foto"
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`Ampliar foto: ${foto.alt}`}
                  >
                    <img
                      src={foto.miniatura}
                      srcSet={`${foto.miniatura} 400w, ${foto.imagem_media} 1200w`}
                      sizes="(min-width: 640px) 50vw, 100vw"
                      alt={foto.alt}
                      loading="lazy"
                      decoding="async"
                      style={
                        foto.largura && foto.altura
                          ? { aspectRatio: `${foto.largura} / ${foto.altura}` }
                          : undefined
                      }
                    />
                  </button>
                ))}
              </div>

              {hasMore && (
                <div className="galeria-load-more">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={loadingMore}
                    onClick={loadMore}
                  >
                    {loadingMore ? 'Carregando…' : 'Carregar mais'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <GaleriaLightbox
        fotos={fotos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </>
  )
}
