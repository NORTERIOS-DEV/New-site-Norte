import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Reveal } from '../components/Reveal'
import { AlbumCard } from '../components/AlbumCard'
import { RiverWaves } from '../components/HeroArt'
import { getAlbuns, getGaleriaCategorias } from '../services/galeriaApi'
import type { Paginated } from '../data/blogTypes'
import type { AlbumListItem, Categoria } from '../data/galeriaTypes'
import '../styles/galeria.css'

export function GaleriaPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? '1')
  const categoria = searchParams.get('categoria') ?? ''

  const [data, setData] = useState<Paginated<AlbumListItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])

  function updateParams(patch: Record<string, string | null>) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === '') next.delete(key)
        else next.set(key, value)
      }
      return next
    })
  }

  useEffect(() => {
    getGaleriaCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    getAlbuns({ page, categoria: categoria || undefined })
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page, categoria])

  function goToPage(next: number) {
    updateParams({ page: next === 1 ? null : String(next) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Seo
        title="Galeria de Fotos · Norte Rios"
        description="Fotos das formações e eventos realizados pela Norte Rios."
      />

      <section className="hero galeria-hero-sec" aria-label="Galeria de fotos">
        <div className="wrap">
          <Reveal className="galeria-hero">
            <div>
              <span className="eyebrow">Galeria</span>
              <h2>Fotos de formações e eventos</h2>
            </div>
            <p>Confira registros dos encontros e treinamentos realizados pela Norte Rios.</p>
          </Reveal>
        </div>
        <RiverWaves />
      </section>

      <section className="sec galeria-sec" aria-label="Álbuns de fotos">
        <div className="wrap galeria-grid-wrap">
          <Reveal className="sec-head">
            <span className="eyebrow">Galeria</span>
            <h2>Álbuns de fotos</h2>
            <p className="lead">
              Explore os registros fotográficos das formações e eventos realizados pela Norte Rios.
            </p>
          </Reveal>

          {categorias.length > 0 && (
            <div className="galeria-filters">
              <button
                type="button"
                className={categoria === '' ? 'galeria-filter-btn active' : 'galeria-filter-btn'}
                aria-pressed={categoria === ''}
                onClick={() => updateParams({ categoria: null, page: null })}
              >
                Todos
              </button>
              {categorias.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  className={categoria === c.slug ? 'galeria-filter-btn active' : 'galeria-filter-btn'}
                  aria-pressed={categoria === c.slug}
                  onClick={() => updateParams({ categoria: c.slug, page: null })}
                >
                  {c.nome}
                </button>
              ))}
            </div>
          )}

          {loading && <p className="galeria-state">Carregando álbuns…</p>}

          {!loading && error && (
            <p className="galeria-state">
              Não foi possível carregar a galeria no momento. Tente novamente em
              instantes.
            </p>
          )}

          {!loading && !error && data && data.results.length === 0 && (
            <p className="galeria-state">Nenhum álbum publicado ainda.</p>
          )}

          {!loading && !error && data && data.results.length > 0 && (
            <>
              <div className="galeria-grid">
                {data.results.map((album) => (
                  <AlbumCard key={album.slug} album={album} />
                ))}
              </div>

              {(data.next || data.previous) && (
                <div className="galeria-pagination">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={!data.previous}
                    onClick={() => goToPage(page - 1)}
                  >
                    Anterior
                  </button>
                  <span>Página {page}</span>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={!data.next}
                    onClick={() => goToPage(page + 1)}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
