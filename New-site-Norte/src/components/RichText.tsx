import { Fragment } from 'react'
import type { RichPart } from '../data/types'

/** Renderiza texto com links inline (ver `RichPart`). */
export function RichText({
  parts,
  linkClassName,
}: {
  parts: RichPart[]
  linkClassName?: string
}) {
  return (
    <>
      {parts.map((part, i) =>
        typeof part === 'string' ? (
          <Fragment key={i}>{part}</Fragment>
        ) : (
          <a
            key={i}
            className={linkClassName}
            href={part.href}
            {...(/^https?:/.test(part.href)
              ? { target: '_blank', rel: 'noopener' }
              : {})}
          >
            {part.text}
          </a>
        ),
      )}
    </>
  )
}
