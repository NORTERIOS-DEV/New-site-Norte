import { useEffect, useState } from 'react'
import { Reveal } from '../components/Reveal'
import { BlogPostCard } from '../components/BlogPostCard'
import { getPosts } from '../services/blogApi'
import type { PostListItem } from '../data/blogTypes'
import '../styles/blog.css'

export function BlogDestaques() {
  const [posts, setPosts] = useState<PostListItem[] | null>(null)

  useEffect(() => {
    let cancelled = false

    getPosts({ destaque: true })
      .then((result) => {
        if (!cancelled) setPosts(result.results.slice(0, 3))
      })
      .catch(() => {
        if (!cancelled) setPosts([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!posts || posts.length === 0) return null

  return (
    <section className="sec blog-sec" id="blog-destaques" aria-label="Destaques do blog">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">Edu Norte</span>
          <h2>Destaques do blog</h2>
          <p className="lead">Conteúdos selecionados pela equipe Norte Rios.</p>
        </Reveal>

        <div className="blog-grid destaque-grid">
          <BlogPostCard post={posts[0]} featured size="lg" />
          {posts.slice(1).map((post) => (
            <BlogPostCard key={post.slug} post={post} featured size="sm" />
          ))}
        </div>
      </div>
    </section>
  )
}
