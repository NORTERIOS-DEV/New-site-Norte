import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { useRevealRef } from '../hooks/useRevealRef'

type RevealProps<T extends ElementType> = {
  as?: T
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>

/**
 * Envolve um elemento com a classe `reveal` e arma o observador de entrada na
 * viewport. `as` escolhe a tag renderizada (padrão `div`) para manter o DOM
 * igual ao do site legado (ex.: `<Reveal as="article" className="prob">`).
 */
export function Reveal<T extends ElementType = 'div'>({
  as,
  className,
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  const ref = useRevealRef()

  return (
    <Tag
      ref={ref}
      className={className ? `reveal ${className}` : 'reveal'}
      {...rest}
    />
  )
}
