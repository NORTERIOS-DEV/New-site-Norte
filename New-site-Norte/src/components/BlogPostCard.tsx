import { Link } from 'react-router-dom'
import { Reveal } from './Reveal'
import { IconArrow } from './icons'
import type { PostListItem } from '../data/blogTypes'

const COVER_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect width="400" height="200" fill="%23d7e9cd"/%3E%3C/svg%3E'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function BlogPostCard({
  post,
  featured = false,
  size = 'lg',
}: {
  post: PostListItem
  featured?: boolean
  size?: 'lg' | 'sm'
}) {
  if (featured) {
    return (
      <Reveal as="article" className={`post post--featured post--featured-${size}`}>
        <Link to={`/blog/${post.slug}`} className="featured-media">
          <img
            src={post.imagem_capa ?? COVER_PLACEHOLDER}
            alt={post.titulo}
            loading="lazy"
          />
          <div className="featured-overlay">
            {post.categoria && <span className="tag">{post.categoria.nome}</span>}
            <h3>{post.titulo}</h3>
            <p className="pdates">
              <em>Publicado em</em> {formatDate(post.data_publicacao)}
              <span className="sep">·</span>
              <em>por</em> {post.autor_nome}
            </p>
          </div>
        </Link>
      </Reveal>
    )
  }

  return (
    <Reveal as="article" className="post">
      <Link to={`/blog/${post.slug}`} className="cover">
        <img
          src={post.imagem_capa ?? COVER_PLACEHOLDER}
          alt={post.titulo}
          loading="lazy"
        />
      </Link>
      <div className="body">
        {post.categoria && <span className="tag">{post.categoria.nome}</span>}
        <h3>
          <Link to={`/blog/${post.slug}`} style={{ color: 'inherit' }}>
            {post.titulo}
          </Link>
        </h3>
        <p className="pdates">
          <em>Publicado em</em> {formatDate(post.data_publicacao)}
          <span className="sep">·</span>
          <em>por</em> {post.autor_nome}
        </p>
        <p>{post.resumo}</p>
        <Link to={`/blog/${post.slug}`} className="more">
          Ler mais
          <IconArrow />
        </Link>
      </div>
    </Reveal>
  )
}
