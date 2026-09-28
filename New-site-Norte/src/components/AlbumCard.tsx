import { Link } from 'react-router-dom'
import { Reveal } from './Reveal'
import { IconArrow } from './icons'
import type { AlbumListItem } from '../data/galeriaTypes'

const COVER_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect width="400" height="200" fill="%23d7e9cd"/%3E%3C/svg%3E'

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

export function AlbumCard({ album }: { album: AlbumListItem }) {
  return (
    <Reveal as="article" className="album-card">
      <Link to={`/galeria/${album.slug}`} className="album-card-link">
        <img src={album.capa ?? COVER_PLACEHOLDER} alt={album.titulo} loading="lazy" decoding="async" />
        <div className="album-card-overlay">
          <span className="album-card-tag">
            {album.total_fotos} {album.total_fotos === 1 ? 'foto' : 'fotos'}
          </span>
          {album.categoria && <span className="album-card-categoria">{album.categoria.nome}</span>}
          <h3>{album.titulo}</h3>
          {album.data_evento && <p className="album-card-date">{formatDate(album.data_evento)}</p>}
        </div>
        <span className="album-card-arrow" aria-hidden="true">
          <IconArrow />
        </span>
      </Link>
    </Reveal>
  )
}
