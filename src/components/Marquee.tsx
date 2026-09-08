import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/**
 * Faixa rolante de "chips". Reproduz o site legado: o conteúdo é duplicado
 * (para o loop contínuo do @keyframes scrollX) exceto sob prefers-reduced-motion.
 */
export function Marquee({ items }: { items: string[] }) {
  const reduced = usePrefersReducedMotion()
  const list = reduced ? items : [...items, ...items]

  return (
    <div className="marquee">
      <div className="marquee-track">
        {list.map((label, i) => (
          <span className="chip" key={i}>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
