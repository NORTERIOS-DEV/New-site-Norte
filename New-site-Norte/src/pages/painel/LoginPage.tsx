import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogoWordmark } from '../../components/LogoWordmark'
import '../../styles/painel.css'

type LoginFormValues = {
  username: string
  password: string
}

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [erro, setErro] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<LoginFormValues>()

  if (isAuthenticated) {
    const from = user?.tipo === 'comum' ? '/painel/perfil' : ((location.state as { from?: Location })?.from?.pathname ?? '/painel/posts')
    return <Navigate to={from} replace />
  }

  async function onSubmit(data: LoginFormValues) {
    setErro(null)
    try {
      await login(data.username, data.password)
      navigate('/painel', { replace: true })
    } catch {
      setErro('Usuário ou senha inválidos.')
    }
  }

  return (
    <div className="painel-login">
      <form className="painel-login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="painel-login-logo">
          <LogoWordmark />
        </div>
        <h1>Painel Norte Rios</h1>

        <div className="painel-field">
          <label>
            Usuário
            <input autoFocus autoComplete="username" {...register('username', { required: true })} />
          </label>
          {errors.username && <span className="painel-field-error">Informe o usuário.</span>}
        </div>

        <div className="painel-field">
          <label>
            Senha
            <input type="password" autoComplete="current-password" {...register('password', { required: true })} />
          </label>
          {errors.password && <span className="painel-field-error">Informe a senha.</span>}
        </div>

        {erro && <p className="painel-form-error">{erro}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
