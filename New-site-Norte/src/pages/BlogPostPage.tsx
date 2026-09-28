import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Reveal } from '../components/Reveal'
import { SafeHtml } from '../components/SafeHtml'
import { BlogPostCard } from '../components/BlogPostCard'
import { IconCalendar, IconInstagram, IconUser, IconWhatsApp } from '../components/icons'
import { NotFoundPage } from './NotFoundPage'
import { getPostBySlug, getPosts } from '../services/blogApi'
import { contact, waLink, waMessages } from '../data/contact'
import type { PostDetail, PostListItem } from '../data/blogTypes'
import '../styles/blog.css'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function BlogPostPage() {
  const { slug } = useParams()

  const [post, setPost] = useState<PostDetail | null | undefined>(undefined)
  const [error, setError] = useState(false)
  const [related, setRelated] = useState<PostListItem[]>([])

  useEffect(() => {
    let cancelled = false
    setPost(undefined)
    setError(false)

    getPostBySlug(slug ?? '')
      .then((result) => {
        if (!cancelled) setPost(result)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (!post) {
      setRelated([])
      return
    }
    let cancelled = false

    async function loadRelated(current: PostDetail) {
      try {
        let items: PostListItem[] = []
        if (current.categoria) {
          const byCategoria = await getPosts({ categoria: current.categoria.slug })
          items = byCategoria.results.filter((p) => p.slug !== current.slug)
        }
        if (items.length < 3) {
          const latest = await getPosts({})
          const seen = new Set(items.map((p) => p.id))
          const more = latest.results.filter(
            (p) => p.slug !== current.slug && !seen.has(p.id),
          )
          items = [...items, ...more]
        }
        if (!cancelled) setRelated(items.slice(0, 3))
      } catch {
        if (!cancelled) setRelated([])
      }
    }

    loadRelated(post)

    return () => {
      cancelled = true
    }
  }, [post])

  if (error) {
    return (
      <section className="sec post-detail-sec">
        <div className="wrap">
          <p className="blog-state">
            Não foi possível carregar este post no momento. Tente novamente em
            instantes.
          </p>
        </div>
      </section>
    )
  }

  if (post === undefined) {
    return (
      <section className="sec post-detail-sec">
        <div className="wrap">
          <p className="blog-state">Carregando post…</p>
        </div>
      </section>
    )
  }

  if (post === null) return <NotFoundPage />

  return (
    <>
      <Seo title={`${post.titulo} · Blog Edu Norte · Norte Rios`} description={post.resumo} />

      <section className="sec post-detail-sec" aria-label={post.titulo}>
        <div className="wrap">
          <Reveal>
            <Link to="/blog" className="eyebrow" style={{ cursor: 'pointer' }}>
              ← Blog
            </Link>
            <h2 style={{ fontSize: 'clamp(1.7rem,3.6vw,2.6rem)', maxWidth: 900, marginTop: 16 }}>
              {post.titulo}
            </h2>
            <p
              className="lead"
              style={{
                color: 'var(--ink-soft)',
                fontSize: '1.12rem',
                marginTop: 16,
                maxWidth: 820,
              }}
            >
              {post.resumo}
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', marginTop: 20 }}>
              {post.categoria && (
                <span className="post-category">{post.categoria.nome}</span>
              )}
              <span className="post-meta">
                <IconCalendar />
                {formatDate(post.data_publicacao)}
              </span>
              <span className="post-meta">
                <IconUser />
                {post.autor_nome}
              </span>
            </div>
          </Reveal>

          <Reveal className="post-main-card">
            {post.imagem_capa && (
              <div className="post-hero-cover">
                <img src={post.imagem_capa} alt={post.titulo} />
              </div>
            )}
            <div className="post-body-card">
              <SafeHtml className="post-content" html={post.conteudo} />
            </div>
          </Reveal>

          <Reveal className="post-footer">
            <div className="post-author">
              <span className="post-author-icon">
                <IconUser />
              </span>
              <div>
                <strong>{post.autor_nome}</strong>
                <span>Equipe Norte Rios</span>
              </div>
            </div>

            <div className="post-links">
              <h4>Norte Rios</h4>
              <div className="post-links-list">
                <a href={waLink(waMessages.falar)} target="_blank" rel="noopener">
                  <span className="pli">
                    <IconWhatsApp />
                  </span>
                  Falar no WhatsApp
                </a>
                <a href={contact.instagram} target="_blank" rel="noopener">
                  <span className="pli">
                    <IconInstagram />
                  </span>
                  {contact.instagramHandle}
                </a>
              </div>
            </div>

            {related.length > 0 && (
              <div className="post-related">
                <h4>Outros posts</h4>
                <div className="blog-grid">
                  {related.map((p) => (
                    <BlogPostCard key={p.slug} post={p} />
                  ))}
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>
    </>
  )
}
