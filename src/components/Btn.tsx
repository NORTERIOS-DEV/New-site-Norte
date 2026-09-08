import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconArrow } from './icons'

type Variant = 'solid' | 'ghost' | 'light'

type BtnProps = {
  /** Rota interna (usa <Link>). */
  to?: string
  /** URL (usa <a>). Se começar com http, abre em nova aba. */
  href?: string
  external?: boolean
  variant?: Variant
  /** Mostra a seta "→" depois do texto. */
  arrow?: boolean
  className?: string
  style?: CSSProperties
  onClick?: () => void
  children: ReactNode
}

function classes(variant: Variant, extra?: string): string {
  const mod =
    variant === 'ghost' ? ' btn--ghost' : variant === 'light' ? ' btn--light' : ''
  return `btn${mod}${extra ? ` ${extra}` : ''}`
}

export function Btn({
  to,
  href,
  external,
  variant = 'solid',
  arrow = false,
  className,
  style,
  onClick,
  children,
}: BtnProps) {
  const content = (
    <>
      {children}
      {arrow && <IconArrow />}
    </>
  )

  if (to !== undefined) {
    return (
      <Link
        to={to}
        className={classes(variant, className)}
        style={style}
        onClick={onClick}
      >
        {content}
      </Link>
    )
  }

  const isExternal = external ?? (href ? /^https?:/.test(href) : false)
  return (
    <a
      href={href}
      className={classes(variant, className)}
      style={style}
      onClick={onClick}
      {...(isExternal ? { target: '_blank', rel: 'noopener' } : {})}
    >
      {content}
    </a>
  )
}
