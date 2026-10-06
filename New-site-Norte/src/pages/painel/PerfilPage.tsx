import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { ContaForm } from '../../components/painel/ContaForm'
import { ContaDetails } from '../../components/painel/ContaDetails'
import { PasswordForm } from '../../components/painel/PasswordForm'
import { ImageDropInput } from '../../components/painel/ImageDropInput'
import { PainelPageHeader } from '../../components/painel/PainelPageHeader'
import { IconArrowLeft, IconInstagram, IconLinkedin, IconUser } from '../../components/painel/icons'
import { PainelApiError, painelFetchJson } from '../../services/painel/httpClient'
import { apiError } from '../../services/painel/usuariosApi'
import type { Autor } from '../../data/painel/painelTypes'
import '../../styles/painel.css'

const AUTHOR_FIELDS = {
  nome_exibicao: 'Nome de exibição',
  formacao_especialidade: 'Formação / especialidade',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
}

function AutoriaForm({ autor, onCancel, onSave }: { autor: Autor; onCancel: () => void; onSave: (body: FormData) => Promise<unknown> }) {
  const [foto, setFoto] = useState<File | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const body = new FormData(form)
    const errors: Record<string, string> = {}
    for (const input of form.querySelectorAll('input[type="url"]')) {
      if (input instanceof HTMLInputElement && !input.validity.valid) errors[input.name] = 'Informe uma URL válida.'
    }
    setFieldErrors(errors)
    setError('')
    if (Object.keys(errors).length) return
    if (foto) body.set('foto', foto)
    setPending(true)
    try {
      await onSave(body)
      setFoto(null)
    } catch (err) {
      if (err instanceof PainelApiError && err.body && typeof err.body === 'object') {
        const errors: Record<string, string> = {}
        for (const [field, messages] of Object.entries(err.body)) {
          if ([...Object.keys(AUTHOR_FIELDS), 'mini_bio', 'foto'].includes(field)) errors[field] = Array.isArray(messages) ? messages.join(' ') : String(messages)
        }
        setFieldErrors(errors)
        if (!Object.keys(errors).length) setError(apiError(err))
      } else {
        setError(apiError(err))
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="painel-post-form" onSubmit={submit} noValidate aria-label="Perfil de autoria">
      <h2 className="painel-form-section-title">Perfil de autoria</h2>
      <div className="painel-form-grid">
        {Object.entries(AUTHOR_FIELDS).map(([field, label]) => (
          <div className="painel-field" key={field}>
            <label>
              {label}
              <input
                name={field}
                type={field === 'instagram' || field === 'linkedin' ? 'url' : 'text'}
                placeholder={field === 'instagram' ? 'https://instagram.com/...' : field === 'linkedin' ? 'https://linkedin.com/in/...' : undefined}
                defaultValue={autor[field as keyof typeof AUTHOR_FIELDS]}
                aria-invalid={Boolean(fieldErrors[field])}
              />
            </label>
            {fieldErrors[field] && <span className="painel-field-error">{fieldErrors[field]}</span>}
          </div>
        ))}
        <div className="painel-field painel-field-full">
          <label>Mini biografia<textarea name="mini_bio" rows={3} defaultValue={autor.mini_bio} aria-invalid={Boolean(fieldErrors.mini_bio)} /></label>
          {fieldErrors.mini_bio && <span className="painel-field-error">{fieldErrors.mini_bio}</span>}
        </div>
        <div className="painel-field painel-field-full">
          <label>Foto<ImageDropInput file={foto} onFileChange={setFoto} existingImageUrl={autor.foto} /></label>
          {fieldErrors.foto && <span className="painel-field-error">{fieldErrors.foto}</span>}
        </div>
      </div>
      {error && <p className="painel-form-error" role="alert">{error}</p>}
      <div className="painel-form-actions">
        <button type="button" onClick={onCancel} disabled={pending}>Cancelar</button>
        <button type="submit" disabled={pending}>{pending ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </form>
  )
}

function AutoriaDetails({ autor }: { autor: Autor }) {
  const nome = autor.nome_exibicao || autor.nome
  const partes = autor.nome.trim().split(/\s+/)
  const iniciais = `${partes[0]?.[0] ?? ''}${partes.length > 1 ? partes[partes.length - 1][0] : ''}`.toUpperCase()

  return (
    <div className="painel-post-form">
      <h2 className="painel-form-section-title">Perfil de autoria</h2>
      <div className="painel-autor-profile">
        <div className="painel-autor-profile-photo">
          {autor.foto ? <img className="painel-thumb painel-thumb-xl" src={autor.foto} alt={nome} /> : <div className="painel-autor-profile-avatar-fallback">{iniciais}</div>}
        </div>
        <div className="painel-autor-profile-info">
          <div className="painel-autor-profile-header"><h2>{nome}</h2></div>
          {autor.nome_exibicao && autor.nome_exibicao !== autor.nome && <p className="painel-autor-profile-handle">Nome: {autor.nome}</p>}
          <p className="painel-autor-profile-subtitle">{[autor.cargo, autor.formacao_especialidade].filter(Boolean).join(' · ')}</p>
          {(autor.instagram || autor.linkedin) && (
            <div className="painel-autor-profile-social">
              {autor.instagram && <a href={autor.instagram} target="_blank" rel="noreferrer" title="Instagram"><IconInstagram /></a>}
              {autor.linkedin && <a href={autor.linkedin} target="_blank" rel="noreferrer" title="LinkedIn"><IconLinkedin /></a>}
            </div>
          )}
          <p className="painel-autor-profile-bio">{autor.mini_bio || 'Sem biografia cadastrada.'}</p>
        </div>
      </div>
    </div>
  )
}

export function PerfilPage() {
  const { user, reloadUser, logout } = useAuth()
  const client = useQueryClient()
  const navigate = useNavigate()
  const editing = useLocation().pathname.endsWith('/editar')
  const { data: autor, isLoading, error: authorError } = useQuery({
    queryKey: ['painel', 'me', 'autor'],
    queryFn: () => painelFetchJson<Autor>('/auth/me/autor/'),
    enabled: user?.tipo === 'autor',
  })

  if (!user) return null
  const voltar = () => navigate('/painel/perfil')

  async function salvarPerfil(body: Record<string, unknown>) {
    await painelFetchJson('/auth/me/', { method: 'PATCH', body })
    await reloadUser()
    await client.invalidateQueries({ queryKey: ['painel', 'me', 'autor'] })
    toast.success('Perfil atualizado com sucesso!')
  }

  async function salvarAutoria(body: FormData) {
    await painelFetchJson('/auth/me/autor/', { method: 'PATCH', body })
    await client.invalidateQueries({ queryKey: ['painel', 'me', 'autor'] })
    toast.success('Perfil de autoria atualizado com sucesso!')
  }

  async function trocarSenha(body: Record<string, unknown>) {
    await painelFetchJson('/auth/me/senha/', { method: 'POST', body })
    toast.success('Senha alterada. Entre novamente.')
    logout()
  }

  return (
    <div>
      <PainelPageHeader
        icon={<IconUser />}
        title={editing ? 'Editar meu perfil' : 'Meu perfil'}
        description={editing ? 'Atualize seus dados pessoais, seu perfil de autoria e sua senha.' : 'Confira seus dados pessoais e as informações da sua conta.'}
        actions={editing ? (
          <button type="button" className="painel-back-button" onClick={voltar}><IconArrowLeft />Voltar</button>
        ) : (
          <button type="button" className="painel-primary-button" onClick={() => navigate('/painel/perfil/editar')}>Editar perfil</button>
        )}
      />
      {editing ? <ContaForm conta={user} title="Dados básicos" onCancel={voltar} onSave={salvarPerfil} /> : <ContaDetails conta={user} />}
      {user.tipo === 'autor' && (
        <div className="painel-profile-section">
          {isLoading && <p>Carregando perfil de autoria…</p>}
          {authorError && <p className="painel-form-error" role="alert">{apiError(authorError)}</p>}
          {autor && (editing ? <AutoriaForm key={autor.id} autor={autor} onCancel={voltar} onSave={salvarAutoria} /> : <AutoriaDetails autor={autor} />)}
        </div>
      )}
      {editing && <div className="painel-profile-section"><PasswordForm own onCancel={voltar} onSave={trocarSenha} /></div>}
    </div>
  )
}
