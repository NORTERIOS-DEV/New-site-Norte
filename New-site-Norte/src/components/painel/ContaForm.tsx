import { useState, type FormEvent } from 'react'
import type { PainelUser } from '../../services/painel/authApi'
import { apiError } from '../../services/painel/usuariosApi'
import { PainelApiError } from '../../services/painel/httpClient'

const FIELD_LABELS = {
  nome_completo: 'Nome completo',
  email: 'E-mail',
  telefone: 'Telefone com DDD',
  username: 'Usuário',
  cargo: 'Cargo / função',
}

type ContaFormProps = {
  conta?: PainelUser
  admin?: boolean
  modal?: boolean
  title?: string
  onCancel?: () => void
  onSave: (body: Record<string, unknown>) => Promise<unknown>
}

export function ContaForm({ conta, admin = false, modal = false, title, onCancel, onSave }: ContaFormProps) {
  const fields: (keyof typeof FIELD_LABELS)[] = [
    'nome_completo', 'email', 'telefone', ...(admin ? ['username', 'cargo'] as const : []),
  ]
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fd = new FormData(form)
    const invalid: Record<string, string> = {}
    for (const input of form.querySelectorAll('input, select')) {
      if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
        if (!input.validity.valid) invalid[input.name] = input.validity.valueMissing ? 'Preencha este campo.' : 'Informe um valor válido.'
      }
    }
    setFieldErrors(invalid)
    setError('')
    if (Object.keys(invalid).length) return

    const body: Record<string, unknown> = Object.fromEntries(fd.entries())
    if (conta) {
      for (const field of fields) {
        if (!conta[field] && body[field] === '') delete body[field]
      }
    }
    if (admin) body.is_active = fd.has('is_active')
    setPending(true)
    try {
      await onSave(body)
    } catch (err) {
      if (err instanceof PainelApiError && err.body && typeof err.body === 'object') {
        const errors: Record<string, string> = {}
        for (const [field, messages] of Object.entries(err.body)) {
          if ([...fields, 'tipo', 'is_active', 'password'].includes(field)) {
            errors[field] = Array.isArray(messages) ? messages.join(' ') : String(messages)
          }
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
    <form
      className={modal ? 'painel-modal painel-modal-wide' : 'painel-post-form'}
      onClick={(event) => event.stopPropagation()}
      onSubmit={submit}
      noValidate
      aria-label={title ?? 'Dados básicos'}
    >
      {title && <h2 className={modal ? undefined : 'painel-form-section-title'}>{title}</h2>}
      <div className={modal ? 'painel-modal-grid' : 'painel-form-grid'}>
        {fields.map((field, index) => (
          <div className="painel-field" key={field}>
            <label>
              {FIELD_LABELS[field]}
              <input
                name={field}
                type={field === 'email' ? 'email' : field === 'telefone' ? 'tel' : 'text'}
                autoFocus={index === 0}
                required={!conta || Boolean(conta[field])}
                defaultValue={conta?.[field] ?? ''}
                aria-invalid={Boolean(fieldErrors[field])}
              />
            </label>
            {fieldErrors[field] && <span className="painel-field-error">{fieldErrors[field]}</span>}
          </div>
        ))}
        {admin && (
          <>
            <div className="painel-field">
              <label>
                Tipo de usuário
                <select name="tipo" defaultValue={conta?.tipo ?? 'comum'}>
                  <option value="comum">Usuário comum</option>
                  <option value="autor">Autor</option>
                  <option value="gerente">Gerente</option>
                </select>
              </label>
              {fieldErrors.tipo && <span className="painel-field-error">{fieldErrors.tipo}</span>}
            </div>
            {!conta && (
              <div className="painel-field">
                <label>
                  Senha inicial
                  <input name="password" type="password" autoComplete="new-password" required aria-invalid={Boolean(fieldErrors.password)} />
                </label>
                {fieldErrors.password && <span className="painel-field-error">{fieldErrors.password}</span>}
              </div>
            )}
            <label className="painel-checkbox">
              <input type="checkbox" name="is_active" defaultChecked={conta?.is_active ?? true} />
              Conta ativa
              {fieldErrors.is_active && <span className="painel-field-error">{fieldErrors.is_active}</span>}
            </label>
          </>
        )}
      </div>
      {error && <p className="painel-form-error" role="alert">{error}</p>}
      <div className={modal ? 'painel-modal-actions' : 'painel-form-actions'}>
        {onCancel && <button type="button" onClick={onCancel} disabled={pending}>Cancelar</button>}
        <button type="submit" disabled={pending}>{pending ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </form>
  )
}
