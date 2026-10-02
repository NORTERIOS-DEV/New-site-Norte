import type { JSONContent } from '@tiptap/core'
import { SafeContent } from '../SafeContent'
import { IconUser } from '../icons'
import '../../styles/blog.css'

type PostPreviewModalProps = {
  titulo: string
  resumo: string
  imagemCapaUrl: string | null
  categoriaNome: string | null
  autorNome: string | null
  conteudoJson: JSONContent | null
  onClose: () => void
}

/** Pré-visualização do post dentro do próprio painel, sem sair da tela de
 * edição - reaproveita SafeContent + as classes de blog.css pra ficar
 * visualmente fiel ao post publicado de verdade (BlogPostPage.tsx). Não se
 * autoportala: quem chama envolve em createPortal(..., document.body), mesmo
 * padrão de ConfirmModal/FotoFormModal. */
export function PostPreviewModal({
  titulo,
  resumo,
  imagemCapaUrl,
  categoriaNome,
  autorNome,
  conteudoJson,
  onClose,
}: PostPreviewModalProps) {
  return (
    <div className="painel-modal-backdrop" onClick={onClose}>
      <div className="painel-modal painel-modal-preview" onClick={(event) => event.stopPropagation()}>
        <div className="painel-modal-preview-header">
          <h2>Pré-visualização</h2>
          <button type="button" className="painel-modal-preview-close" onClick={onClose} aria-label="Fechar pré-visualização">
            ×
          </button>
        </div>

        <div className="painel-modal-preview-body">
          <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', marginTop: 0, maxWidth: 820 }}>{titulo || 'Sem título'}</h2>
          {resumo && (
            <p className="lead" style={{ color: 'var(--ink-soft)', fontSize: '1.05rem', maxWidth: 820 }}>
              {resumo}
            </p>
          )}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', margin: '16px 0 24px' }}>
            {categoriaNome && <span className="post-category">{categoriaNome}</span>}
            {autorNome && (
              <span className="post-meta">
                <IconUser />
                {autorNome}
              </span>
            )}
          </div>

          <div className="post-main-card">
            {imagemCapaUrl && (
              <div className="post-hero-cover">
                <img src={imagemCapaUrl} alt={titulo} />
              </div>
            )}
            <div className="post-body-card">
              <SafeContent className="post-content" html="" json={conteudoJson} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
