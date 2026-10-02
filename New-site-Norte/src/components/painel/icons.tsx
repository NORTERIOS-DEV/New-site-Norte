/**
 * Ícones das ações de postagens/galeria no painel (viewBox 24×24, mesmo
 * estilo de traço de `components/icons.tsx` do site público). Ficam num
 * arquivo à parte porque só o /painel os usa - mantém esses paths fora do
 * bundle público.
 */
type IconProps = { className?: string }

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconEdit({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  )
}

/** Mais ações - três pontinhos (abre o menu editar/excluir de uma foto). */
export function IconMore({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}

export function IconEye({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

/** Publicar - seta saindo de uma bandeja (enviar/tornar público). */
export function IconPublish({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M12 19V6" />
      <path d="M6 11l6-6 6 6" />
      <path d="M4 19h16" />
    </svg>
  )
}

/** Despublicar/tornar rascunho - seta entrando numa bandeja (recolher). */
export function IconUnpublish({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M12 5v13" />
      <path d="M18 13l-6 6-6-6" />
      <path d="M4 19h16" />
    </svg>
  )
}

export function IconTrash({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

/** Enviar fotos (upload em lote da galeria). */
export function IconUploadImage({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  )
}

/** Link social - Instagram (perfil de autor na página de detalhe). */
export function IconInstagram({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Link social - LinkedIn (perfil de autor na página de detalhe). */
export function IconLinkedin({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 11v5M8 8v.01M12 16v-3.2a1.8 1.8 0 0 1 3.6 0V16M12 11v5" />
    </svg>
  )
}

/** Identidade da página de Postagens - folha de texto. */
export function IconPost({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M8 13h8M8 17h8M8 9h2" />
    </svg>
  )
}

/** Identidade da página de Categorias - etiqueta. */
export function IconTag({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M12.59 2.59a2 2 0 0 1 1.41.59l6.82 6.82a2 2 0 0 1 0 2.82l-7.17 7.17a2 2 0 0 1-2.82 0l-6.82-6.82A2 2 0 0 1 3.4 11.8V5a2 2 0 0 1 2-2z" />
      <circle cx="7.5" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Identidade das páginas de Autores - silhueta de pessoa. */
export function IconUser({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

/** Voltar - seta para a esquerda (botão de voltar nas páginas de detalhe/formulário). */
export function IconArrowLeft({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </svg>
  )
}

/** Identidade das páginas de Galeria - fotos empilhadas. */
export function IconGallery({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <rect x="2" y="7" width="15" height="13" rx="2" />
      <path d="M6 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2" />
      <circle cx="8" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <path d="M2 17l4-4 3 3 4-4 4 4" />
    </svg>
  )
}
