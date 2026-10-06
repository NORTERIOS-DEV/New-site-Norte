import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { ContaForm } from '../../components/painel/ContaForm'
import { ContaDetails, TIPO_LABELS } from '../../components/painel/ContaDetails'
import { ConfirmModal } from '../../components/painel/ConfirmModal'
import { PasswordForm } from '../../components/painel/PasswordForm'
import { PainelPageHeader } from '../../components/painel/PainelPageHeader'
import { IconArrowLeft, IconEdit, IconEye, IconTrash, IconUser } from '../../components/painel/icons'
import { useAuth } from '../../context/AuthContext'
import { listUsuarios, getUsuario, saveUsuario, deleteUsuario, apiError } from '../../services/painel/usuariosApi'
import { painelFetchJson } from '../../services/painel/httpClient'
import type { PainelUser } from '../../services/painel/authApi'
import '../../styles/painel.css'

export function UsuariosPage() {
  const [params, setParams] = useSearchParams()
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<PainelUser | null>(null)
  const [deleting, setDeleting] = useState<PainelUser | null>(null)
  const [pending, setPending] = useState(false)
  const client = useQueryClient()
  const { user, reloadUser } = useAuth()
  const page = Number(params.get('page') ?? 1)
  const { data, isLoading, error } = useQuery({
    queryKey: ['painel', 'usuarios', params.toString()],
    queryFn: () => listUsuarios(params),
  })

  function filter(key: string, value: string) {
    const next = new URLSearchParams(params)
    next.delete('page')
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  function mudarPagina(delta: number) {
    const next = new URLSearchParams(params)
    next.set('page', String(page + delta))
    setParams(next)
  }

  function abrirFormulario(conta: PainelUser | null) {
    setEditando(conta)
    setFormAberto(true)
  }

  async function salvar(body: Record<string, unknown>) {
    await saveUsuario(editando?.id ?? null, body)
    setFormAberto(false)
    await client.invalidateQueries({ queryKey: ['painel', 'usuarios'] })
    if (editando?.id === user?.id) await reloadUser()
    toast.success(editando ? 'Conta atualizada com sucesso!' : 'Conta cadastrada com sucesso!')
  }

  async function remove() {
    if (!deleting) return
    setPending(true)
    try {
      await deleteUsuario(deleting.id)
      setDeleting(null)
      await client.invalidateQueries({ queryKey: ['painel', 'usuarios'] })
      toast.success('Conta excluída com sucesso!')
    } catch (err) {
      toast.error(apiError(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <PainelPageHeader
        icon={<IconUser />}
        title="Usuários"
        description="Cadastre e gerencie as contas e os perfis de acesso ao painel."
        actions={<button type="button" className="painel-primary-button" onClick={() => abrirFormulario(null)}>Novo usuário</button>}
      />

      <div className="painel-filters">
        <input aria-label="Buscar usuários" placeholder="Nome, e-mail ou usuário" value={params.get('search') ?? ''} onChange={(event) => filter('search', event.target.value)} />
        <select aria-label="Tipo" value={params.get('tipo') ?? ''} onChange={(event) => filter('tipo', event.target.value)}>
          <option value="">Todos os tipos</option>
          {Object.entries(TIPO_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select aria-label="Situação" value={params.get('is_active') ?? ''} onChange={(event) => filter('is_active', event.target.value)}>
          <option value="">Todas as situações</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </div>

      {isLoading && <p>Carregando…</p>}
      {error && <p className="painel-form-error" role="alert">{apiError(error)}</p>}
      {data && (
        <>
          <table className="painel-table">
            <thead>
              <tr><th>Nome</th><th>Usuário / e-mail</th><th>Tipo</th><th>Status</th><th aria-label="Ações" /></tr>
            </thead>
            <tbody>
              {data.results.map((conta) => (
                <tr key={conta.id}>
                  <td data-label="Nome">{conta.nome_completo || 'Não informado'}</td>
                  <td data-label="Usuário / e-mail">{conta.username}<br />{conta.email}</td>
                  <td data-label="Tipo">{TIPO_LABELS[conta.tipo]}</td>
                  <td data-label="Status">
                    <span className={`painel-status-badge ${conta.is_active ? 'publicado' : 'rascunho'}`}>{conta.is_active ? 'Ativo' : 'Inativo'}</span>
                  </td>
                  <td className="painel-table-cell-actions">
                    <div className="painel-table-actions">
                      <Link to={`/painel/usuarios/${conta.id}`} data-tooltip="Visualizar"><IconEye /><span className="painel-sr-only">Visualizar</span></Link>
                      <button type="button" data-tooltip="Editar" onClick={() => abrirFormulario(conta)}><IconEdit /><span className="painel-sr-only">Editar</span></button>
                      <button type="button" className="destrutivo" data-tooltip="Excluir" disabled={conta.id === user?.id} onClick={() => setDeleting(conta)}><IconTrash /><span className="painel-sr-only">Excluir</span></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.results.length === 0 && <tr><td colSpan={5} className="painel-empty">Nenhuma conta encontrada.</td></tr>}
            </tbody>
          </table>
          <div className="painel-pagination">
            <button type="button" disabled={!data.previous} onClick={() => mudarPagina(-1)}>Anterior</button>
            <button type="button" disabled={!data.next} onClick={() => mudarPagina(1)}>Próxima</button>
          </div>
        </>
      )}

      {formAberto && createPortal(
        <div className="painel-modal-backdrop" onClick={() => setFormAberto(false)}>
          <ContaForm key={editando?.id ?? 'novo'} conta={editando ?? undefined} admin modal title={editando ? 'Editar usuário' : 'Novo usuário'} onCancel={() => setFormAberto(false)} onSave={salvar} />
        </div>,
        document.body,
      )}
      {deleting && <ConfirmModal title="Excluir conta" message={`Excluir ${deleting.username}? O histórico de autoria e suas postagens serão preservados.`} confirmLabel="Excluir" onCancel={() => { if (!pending) setDeleting(null) }} onConfirm={remove} isPending={pending} variant="danger" />}
    </div>
  )
}

export function UsuarioDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const client = useQueryClient()
  const { user, reloadUser, logout } = useAuth()
  const { data, isLoading, error } = useQuery({ queryKey: ['painel', 'usuarios', id], queryFn: () => getUsuario(Number(id)) })
  const [editando, setEditando] = useState(false)
  const [senhaAberta, setSenhaAberta] = useState(false)

  if (isLoading) return <p>Carregando…</p>
  if (error || !data) return <p className="painel-form-error" role="alert">{apiError(error)}</p>

  async function salvar(body: Record<string, unknown>) {
    await saveUsuario(Number(id), body)
    setEditando(false)
    await client.invalidateQueries({ queryKey: ['painel', 'usuarios'] })
    if (user?.id === Number(id)) await reloadUser()
    toast.success('Conta atualizada com sucesso!')
  }

  async function redefinirSenha(body: Record<string, unknown>) {
    await painelFetchJson(`/usuarios/${id}/senha/`, { method: 'POST', body })
    setSenhaAberta(false)
    toast.success('Senha redefinida. Sessões anteriores encerradas.')
    if (user?.id === Number(id)) logout()
  }

  return (
    <div>
      <PainelPageHeader
        icon={<IconUser />}
        title={data.nome_completo || data.username}
        description="Confira os dados cadastrais e gerencie o acesso deste usuário."
        actions={<>
          <button type="button" className="painel-back-button" onClick={() => navigate('/painel/usuarios')}><IconArrowLeft />Voltar</button>
          <button type="button" className="painel-back-button" onClick={() => setSenhaAberta(true)}>Redefinir senha</button>
          <button type="button" className="painel-primary-button" onClick={() => setEditando(true)}>Editar usuário</button>
        </>}
      />
      <ContaDetails conta={data} />
      {editando && createPortal(
        <div className="painel-modal-backdrop" onClick={() => setEditando(false)}>
          <ContaForm conta={data} admin modal title="Editar usuário" onCancel={() => setEditando(false)} onSave={salvar} />
        </div>,
        document.body,
      )}
      {senhaAberta && createPortal(
        <div className="painel-modal-backdrop" onClick={() => setSenhaAberta(false)}>
          <PasswordForm modal onCancel={() => setSenhaAberta(false)} onSave={redefinirSenha} />
        </div>,
        document.body,
      )}
    </div>
  )
}
