import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAutor } from '../../services/painel/autoresApi'
import { IconArrowLeft, IconInstagram, IconLinkedin, IconUser } from '../../components/painel/icons'
import { PainelPageHeader } from '../../components/painel/PainelPageHeader'
import '../../styles/painel.css'

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/)
  const primeira = partes[0]?.[0] ?? ''
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}

export function AutorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: autor, isLoading } = useQuery({
    queryKey: ['painel', 'autores', id],
    queryFn: () => getAutor(Number(id)),
  })

  if (isLoading) return <p>Carregando…</p>
  if (!autor) return <p>Autor não encontrado.</p>

  const nomePublico = autor.nome_exibicao || autor.nome
  const subtitulo = [autor.cargo, autor.formacao_especialidade].filter(Boolean).join(' · ')

  return (
    <div>
      <PainelPageHeader
        icon={<IconUser />}
        title={nomePublico}
        description="Confira os dados completos e as redes sociais deste autor."
        actions={
          <button type="button" className="painel-back-button" onClick={() => navigate('/painel/autores')}>
            <IconArrowLeft />
            Voltar
          </button>
        }
      />

      <div className="painel-post-form">
        <div className="painel-autor-profile">
          <div className="painel-autor-profile-photo">
            {autor.foto ? (
              <img className="painel-thumb painel-thumb-xl" src={autor.foto} alt="" />
            ) : (
              <div className="painel-autor-profile-avatar-fallback">{iniciais(autor.nome)}</div>
            )}
          </div>

          <div className="painel-autor-profile-info">
            <div className="painel-autor-profile-header">
              <h2>{nomePublico}</h2>
              <span className={`painel-status-badge ${autor.ativo ? 'publicado' : 'rascunho'}`}>
                {autor.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            {autor.nome_exibicao && autor.nome_exibicao !== autor.nome && (
              <p className="painel-autor-profile-handle">Nome: {autor.nome}</p>
            )}

            {subtitulo && <p className="painel-autor-profile-subtitle">{subtitulo}</p>}

            {(autor.instagram || autor.linkedin) && (
              <div className="painel-autor-profile-social">
                {autor.instagram && (
                  <a href={autor.instagram} target="_blank" rel="noreferrer" title="Instagram">
                    <IconInstagram />
                  </a>
                )}
                {autor.linkedin && (
                  <a href={autor.linkedin} target="_blank" rel="noreferrer" title="LinkedIn">
                    <IconLinkedin />
                  </a>
                )}
              </div>
            )}

            <p className="painel-autor-profile-bio">{autor.mini_bio || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
