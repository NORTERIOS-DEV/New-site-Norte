import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Reveal } from '../components/Reveal'
import { BlogPostCard } from '../components/BlogPostCard'
import { BlogDestaques } from '../sections/BlogDestaques'
import { RiverWaves } from '../components/HeroArt'
import { IconSearch } from '../components/icons'
import { getCategorias, getPosts } from '../services/blogApi'
import type { Categoria, Paginated, PostListItem } from '../data/blogTypes'
import '../styles/blog.css'

type Ordering = 'data_publicacao' | '-data_publicacao'

export function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? '1')
  const categoria = searchParams.get('categoria') ?? ''
  const search = searchParams.get('search') ?? ''
  const ordering = (searchParams.get('ordering') as Ordering | null) ?? '-data_publicacao'

  const [data, setData] = useState<Paginated<PostListItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [searchInput, setSearchInput] = useState(search)

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
    getCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]))
  }, [])

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== search) updateParams({ search: searchInput || null, page: null })
    }, 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    getPosts({
      page,
      categoria: categoria || undefined,
      search: search || undefined,
      ordering,
    })
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
  }, [page, categoria, search, ordering])

  function goToPage(next: number) {
    updateParams({ page: next === 1 ? null : String(next) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Seo
        title="Blog · Edu Norte · Norte Rios"
        description="Conteúdos sobre educação, gestão e desenvolvimento humano."
      />

      <section className="hero blog-hero-sec" aria-label="Blog Edu Norte">
        <div className="wrap">
          <Reveal className="blog-hero">
            <div>
              <span className="eyebrow">Blog</span>
              <h2>
                <span className="edu">Edu Norte</span>
              </h2>
            </div>
            <p>Conteúdos sobre educação, gestão e desenvolvimento humano.</p>
          </Reveal>
        </div>
        <RiverWaves />
      </section>

      <BlogDestaques />

      <section className="sec" aria-label="Publicações do blog">
        <div className="wrap">
          <div className="blog-filters">
            <div className="blog-search">
              <IconSearch />
              <input
                type="text"
                placeholder="Buscar por título ou resumo…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <select
              value={categoria}
              onChange={(e) => updateParams({ categoria: e.target.value || null, page: null })}
            >
              <option value="">Todas as categorias</option>
              {categorias.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nome}
                </option>
              ))}
            </select>

            <select
              value={ordering}
              onChange={(e) =>
                updateParams({
                  ordering: e.target.value === '-data_publicacao' ? null : e.target.value,
                  page: null,
                })
              }
            >
              <option value="-data_publicacao">Mais recentes</option>
              <option value="data_publicacao">Mais antigos</option>
            </select>
          </div>

          {loading && <p className="blog-state">Carregando publicações…</p>}

          {!loading && error && (
            <p className="blog-state">
              Não foi possível carregar o blog no momento. Tente novamente em
              instantes.
            </p>
          )}

          {!loading && !error && data && data.results.length === 0 && (
            <p className="blog-state">Nenhum post publicado ainda.</p>
          )}

          {!loading && !error && data && data.results.length > 0 && (
            <>
              <div className="blog-grid">
                {data.results.map((post) => (
                  <BlogPostCard key={post.slug} post={post} />
                ))}
              </div>

              {(data.next || data.previous) && (
                <div className="blog-pagination">
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
