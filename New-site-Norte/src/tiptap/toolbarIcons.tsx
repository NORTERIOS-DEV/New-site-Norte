/**
 * Ícones da barra de ferramentas do TipTap (viewBox 24×24, mesmo estilo de
 * traço dos demais ícones do painel). Arquivo à parte porque só o editor
 * usa - fica fora do bundle público e do restante do painel.
 */
type IconProps = { className?: string }

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconBold({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M6 4h7a3.5 3.5 0 0 1 0 7H6z" />
      <path d="M6 11h8a3.5 3.5 0 0 1 0 7H6z" />
    </svg>
  )
}

export function IconItalic({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M11 4h7M6 20h7M15 4 9 20" />
    </svg>
  )
}

export function IconUnderline({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M6 4v6a6 6 0 0 0 12 0V4" />
      <path d="M4 20h16" />
    </svg>
  )
}

export function IconLink({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M9 17H7a5 5 0 0 1 0-10h2" />
      <path d="M15 7h2a5 5 0 0 1 0 10h-2" />
      <path d="M8 12h8" />
    </svg>
  )
}

export function IconParagraph({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M12 4H9.5a4.5 4.5 0 0 0 0 9H12" />
      <path d="M15 4v16M12 4v16" />
    </svg>
  )
}

export function IconListBullet({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.2" cy="6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.2" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.2" cy="18" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconListOrdered({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <text x="1.5" y="8.2" fontSize="6.5" fontFamily="inherit" fill="currentColor" stroke="none">
        1
      </text>
      <text x="1.5" y="14.2" fontSize="6.5" fontFamily="inherit" fill="currentColor" stroke="none">
        2
      </text>
      <text x="1.5" y="20.2" fontSize="6.5" fontFamily="inherit" fill="currentColor" stroke="none">
        3
      </text>
    </svg>
  )
}

export function IconQuote({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M4 17V11a4 4 0 0 1 4-4" />
      <path d="M4 17h4v-6H4" />
      <path d="M13 17V11a4 4 0 0 1 4-4" />
      <path d="M13 17h4v-6h-4" />
    </svg>
  )
}

export function IconAlignLeft({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M3 6h18M3 12h12M3 18h16" />
    </svg>
  )
}

export function IconAlignCenter({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M3 6h18M6 12h12M4 18h16" />
    </svg>
  )
}

export function IconAlignRight({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M3 6h18M9 12h12M5 18h16" />
    </svg>
  )
}

export function IconImage({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M21 16.5 15.5 11 6 20" />
    </svg>
  )
}

export function IconVideo({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M10.5 9.3v5.4a.5.5 0 0 0 .76.43l4.5-2.7a.5.5 0 0 0 0-.86l-4.5-2.7a.5.5 0 0 0-.76.43z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconTable({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M3 16h18M9.5 4v16" />
    </svg>
  )
}

export function IconHorizontalRule({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M4 12h16" />
    </svg>
  )
}

export function IconUndo({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </svg>
  )
}

export function IconRedo({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M15 14l5-5-5-5" />
      <path d="M20 9H10a6 6 0 0 0 0 12h3" />
    </svg>
  )
}

export function IconMaximize({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M16 3h3a2 2 0 0 1 2 2v3" />
      <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  )
}

export function IconMinimize({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M9 3v3a2 2 0 0 1-2 2H4" />
      <path d="M15 3v3a2 2 0 0 0 2 2h3" />
      <path d="M9 21v-3a2 2 0 0 0-2-2H4" />
      <path d="M15 21v-3a2 2 0 0 1 2-2h3" />
    </svg>
  )
}
