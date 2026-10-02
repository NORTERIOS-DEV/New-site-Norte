interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isPending?: boolean
  /** Tonalidade do botão de confirmação, de acordo com a ação executada. */
  variant?: 'danger' | 'success' | 'warning'
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isPending = false,
  variant = 'warning',
}: ConfirmModalProps) {
  return (
    <div className="painel-modal-backdrop" onClick={onCancel}>
      <div className="painel-modal" onClick={(event) => event.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="painel-modal-actions">
          <button type="button" className="painel-confirm-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`painel-confirm-confirm painel-confirm-${variant}`}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Aguarde…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
