import type { ComponentType } from 'react'
import { Reveal } from '../components/Reveal'
import { RiverDivider } from '../components/HeroArt'
import {
  IconLeaf,
  IconSearch,
  IconRefresh,
  IconBook,
  IconChart,
} from '../components/icons'

type Dif = {
  Icon: ComponentType<{ className?: string }>
  n: string
  h: string
}

const items: Dif[] = [
  { Icon: IconLeaf, n: '01', h: 'Soluções adaptadas à realidade de cada município' },
  { Icon: IconSearch, n: '02', h: 'Diagnóstico profundo antes de qualquer ação' },
  { Icon: IconRefresh, n: '03', h: 'Acompanhamento contínuo, do início ao fim' },
  { Icon: IconBook, n: '04', h: 'Formações práticas que geram mudança real' },
  { Icon: IconChart, n: '05', h: 'Foco em resultados mensuráveis' },
]

export function Diferenciais() {
  return (
    <>
      <RiverDivider />
      <section className="sec dif" aria-label="Diferenciais">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow" style={{ justifyContent: 'center' }}>
              Por que a Norte Rios
            </span>
            <h2>Diferenciais que sustentam o resultado</h2>
          </Reveal>

          <div className="dif-grid">
            {items.map(({ Icon, n, h }) => (
              <Reveal className="dif-card" key={n}>
                <Icon className="leaf" />
                <div className="n">{n}</div>
                <h4>{h}</h4>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
