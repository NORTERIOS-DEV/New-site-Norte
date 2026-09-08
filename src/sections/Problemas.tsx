import type { ComponentType, ReactNode } from 'react'
import { Reveal } from '../components/Reveal'
import {
  IconCompass,
  IconMoney,
  IconRocket,
  IconUsers,
} from '../components/icons'

type Problema = {
  Icon: ComponentType<{ className?: string }>
  q: string
  a: ReactNode
}

const items: Problema[] = [
  {
    Icon: IconCompass,
    q: 'Falta de alinhamento estratégico',
    a: (
      <>
        Integramos políticas <b>federais, estaduais e municipais</b> em um plano
        claro e executável.
      </>
    ),
  },
  {
    Icon: IconMoney,
    q: 'Dificuldade com orçamento e recursos',
    a: (
      <>
        Mapeamos oportunidades e organizamos o <b>uso eficiente</b> de cada
        recurso disponível.
      </>
    ),
  },
  {
    Icon: IconRocket,
    q: 'Planejamento que não sai do papel',
    a: (
      <>
        Transformamos metas em ações práticas, com{' '}
        <b>monitoramento contínuo</b> dos resultados.
      </>
    ),
  },
  {
    Icon: IconUsers,
    q: 'Baixa participação da comunidade',
    a: (
      <>
        Fortalecemos conselhos e ampliamos o <b>controle social</b> com
        estratégias efetivas.
      </>
    ),
  },
]

export function Problemas() {
  return (
    <section className="sec" aria-label="Problemas e soluções">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">Problemas &amp; soluções</span>
          <h2>Sua rede enfrenta algum desses desafios?</h2>
          <p className="lead">
            Nós resolvemos com método e acompanhamento — do diagnóstico à
            consolidação dos resultados.
          </p>
        </Reveal>

        <div className="prob-grid">
          {items.map(({ Icon, q, a }) => (
            <Reveal as="article" className="prob" key={q}>
              <div className="q">
                <span className="ic">
                  <Icon />
                </span>
                <h3>{q}</h3>
              </div>
              <p className="a">{a}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
