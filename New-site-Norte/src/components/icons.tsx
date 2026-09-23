/**
 * Ícones SVG reaproveitados do site legado (viewBox 24×24). O tamanho e a cor
 * vêm do CSS do contexto (`.btn svg`, `.tab .ti`, `.res .chk svg`, etc.); aqui
 * mantemos os mesmos paths e espessuras de traço do original.
 */
type IconProps = { className?: string }

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconArrow({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={2.4} {...stroke}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

/** Check grosso (listas .res / .item / .req). */
export function IconCheck({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={3} {...stroke}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

/** Check fino (linha de documento do edital). */
export function IconCheckThin({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={2} {...stroke}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

export function IconCalendar({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={2} {...stroke}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

export function IconClock({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={2} {...stroke}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

export function IconFile({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={2} {...stroke}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}

export function IconDownload({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={2.2} {...stroke}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  )
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={2} {...stroke}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export function IconUser({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={2} {...stroke}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a7 7 0 0 1 14 0v1" />
    </svg>
  )
}

export function IconLock({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={2} {...stroke}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

/* -------- Problemas & soluções -------- */

export function IconCompass({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={2} {...stroke}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  )
}

export function IconMoney({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={2} {...stroke}>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  )
}

export function IconRocket({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={2} {...stroke}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  )
}

/* -------- Diferenciais -------- */

export function IconLeaf({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={1.8} {...stroke}>
      <path d="M12 21s8-5 8-12a4 4 0 0 0-8 0 4 4 0 0 0-8 0c0 7 8 12 8 12z" />
    </svg>
  )
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={1.8} {...stroke}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

export function IconRefresh({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={1.8} {...stroke}>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
    </svg>
  )
}

export function IconBook({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={1.8} {...stroke}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

export function IconChart({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={1.8} {...stroke}>
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 5-6" />
    </svg>
  )
}

/* -------- Serviços (abas + painéis) -------- */

export function IconTable({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={1.8} {...stroke}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 4v16" />
    </svg>
  )
}

export function IconBooks({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={1.8} {...stroke}>
      <path d="M4 5a2 2 0 0 1 2-2h7v18H6a2 2 0 0 0-2 2zM20 3h-7v18h7z" />
    </svg>
  )
}

export function IconCoin({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={1.8} {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.5a2.5 2 0 0 1 5 0c0 1.5-2.5 1.5-2.5 2.5" />
    </svg>
  )
}

export function IconMonitor({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={1.8} {...stroke}>
      <rect x="3" y="3" width="18" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

/* -------- Rodapé / contato -------- */

export function IconWhatsApp({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.5 23.5l1.6-5.8A11.4 11.4 0 1 1 12 23.4a11.4 11.4 0 0 1-5.5-1.4L.5 23.5zM6.8 20l.3.2a9.5 9.5 0 1 0-3.2-3.4l.2.3-1 3.4 3.7-1zm11.4-5.2c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a7.8 7.8 0 0 1-2.3-1.4 8.6 8.6 0 0 1-1.6-2c-.2-.3 0-.4.1-.6l.4-.4.3-.4v-.4c0-.1-.5-1.4-.8-1.9s-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1.1 2.7 11.5 11.5 0 0 0 4.4 3.9c2.6 1 2.6.7 3.1.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z" />
    </svg>
  )
}

export function IconPhone({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={1.9} {...stroke}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
    </svg>
  )
}

export function IconMail({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={1.9} {...stroke}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

export function IconMapPin({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={1.9} {...stroke}>
      <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function IconInstagram({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={1.9} {...stroke}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconGlobe({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" strokeWidth={1.9} {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
    </svg>
  )
}
