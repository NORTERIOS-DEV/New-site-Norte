import type { PainelUser } from '../../services/painel/authApi'

export const TIPO_LABELS = { gerente: 'Gerente', autor: 'Autor', comum: 'Usuário comum' }

export function ContaDetails({ conta }: { conta: PainelUser }) {
  return (
    <div className="painel-post-form">
      <div className="painel-autor-profile-header">
        <h2>{conta.nome_completo || conta.username}</h2>
        <span className={`painel-status-badge ${conta.is_active ? 'publicado' : 'rascunho'}`}>
          {conta.is_active ? 'Ativo' : 'Inativo'}
        </span>
      </div>
      <p className="painel-autor-profile-handle">{conta.username}</p>
      <div className="painel-form-grid">
        {Object.entries({
          'E-mail': conta.email,
          Telefone: conta.telefone,
          'Cargo / função': conta.cargo,
          'Tipo de usuário': TIPO_LABELS[conta.tipo],
        }).map(([label, value]) => (
          <div key={label} className="painel-detail-field">
            <span className="painel-detail-label">{label}</span>
            <p>{value || 'Não informado'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
