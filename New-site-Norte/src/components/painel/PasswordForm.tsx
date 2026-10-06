import { useState, type FormEvent } from 'react'
import { PainelApiError } from '../../services/painel/httpClient'
import { apiError } from '../../services/painel/usuariosApi'

type PasswordFormProps = {
  own?: boolean
  modal?: boolean
  onCancel: () => void
  onSave: (body: Record<string, unknown>) => Promise<unknown>
}

export function PasswordForm({ own = false, modal = false, onCancel, onSave }: PasswordFormProps) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const title = own ? 'Trocar senha' : 'Redefinir senha'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = Object.fromEntries(new FormData(event.currentTarget).entries())
    const errors: Record<string, string> = {}
    if (!body.password) errors.password = 'Informe a nova senha.'
    if (own && !body.senha_atual) errors.senha_atual = 'Informe a senha atual.'
    setFieldErrors(errors)
    setError('')
    if (Object.keys(errors).length) return
    setPending(true)
    try {
      await onSave(body)
    } catch (err) {
      if (err instanceof PainelApiError && err.body && typeof err.body === 'object') {
        const errors: Record<string, string> = {}
        for (const [field, messages] of Object.entries(err.body)) {
          if (field === 'password' || field === 'senha_atual') errors[field] = Array.isArray(messages) ? messages.join(' ') : String(messages)
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
    <form className={modal ? 'painel-modal' : 'painel-post-form'} onClick={(event) => event.stopPropagation()} onSubmit={submit} noValidate aria-label={title}>
      <h2 className={modal ? undefined : 'painel-form-section-title'}>{title}</h2>
      <div className={modal ? undefined : 'painel-form-grid'}>
        {own && (
          <div className="painel-field">
            <label>Senha atual<input name="senha_atual" type="password" autoComplete="current-password" autoFocus required aria-invalid={Boolean(fieldErrors.senha_atual)} /></label>
            {fieldErrors.senha_atual && <span className="painel-field-error">{fieldErrors.senha_atual}</span>}
          </div>
        )}
        <div className="painel-field">
          <label>Nova senha<input name="password" type="password" autoComplete="new-password" autoFocus={!own} required aria-invalid={Boolean(fieldErrors.password)} /></label>
          {fieldErrors.password && <span className="painel-field-error">{fieldErrors.password}</span>}
        </div>
      </div>
      {error && <p className="painel-form-error" role="alert">{error}</p>}
      <div className={modal ? 'painel-modal-actions' : 'painel-form-actions'}>
        <button type="button" onClick={onCancel} disabled={pending}>Cancelar</button>
        <button type="submit" disabled={pending}>{pending ? 'Salvando…' : title}</button>
      </div>
    </form>
  )
}
