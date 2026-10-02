import type { ReactNode } from 'react'

type PainelPageHeaderProps = {
  icon: ReactNode
  title: ReactNode
  description: string
  actions?: ReactNode
}

export function PainelPageHeader({ icon, title, description, actions }: PainelPageHeaderProps) {
  return (
    <div className="painel-crud-header">
      <div className="painel-crud-header-main">
        <span className="painel-crud-header-icon" aria-hidden="true">
          {icon}
        </span>
        <div className="painel-crud-header-titles">
          <h1>{title}</h1>
          <p className="painel-crud-header-description">{description}</p>
        </div>
      </div>
      {actions && <div className="painel-crud-header-actions">{actions}</div>}
    </div>
  )
}
