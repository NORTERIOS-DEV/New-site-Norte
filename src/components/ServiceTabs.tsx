import { useRef, useState } from 'react'
import type { ComponentType, KeyboardEvent } from 'react'
import { Reveal } from './Reveal'
import { services } from '../data/services'
import type { ServiceArea } from '../data/types'
import { IconTable, IconBooks, IconCoin, IconMonitor, IconCheck } from './icons'

const ICONS: Record<ServiceArea['id'], ComponentType<{ className?: string }>> = {
  adm: IconTable,
  ped: IconBooks,
  fin: IconCoin,
  sis: IconMonitor,
}

export function ServiceTabs() {
  const [active, setActive] = useState<ServiceArea['id']>(services[0].id)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const current = services.findIndex((s) => s.id === active)
    let next = current
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
      next = (current + 1) % services.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
      next = (current - 1 + services.length) % services.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = services.length - 1
    else return

    e.preventDefault()
    const id = services[next].id
    setActive(id)
    tabRefs.current[id]?.focus()
  }

  return (
    <>
      <Reveal className="serv-tabs" role="tablist" aria-label="Áreas de serviço">
        {services.map((s) => {
          const Icon = ICONS[s.id]
          const selected = s.id === active
          return (
            <button
              key={s.id}
              className="tab"
              role="tab"
              id={`tab-${s.id}`}
              aria-selected={selected}
              aria-controls={s.id}
              tabIndex={selected ? 0 : -1}
              ref={(el) => {
                tabRefs.current[s.id] = el
              }}
              onClick={() => setActive(s.id)}
              onKeyDown={onKeyDown}
            >
              <Icon className="ti" />
              {s.aba}
            </button>
          )
        })}
      </Reveal>

      <Reveal>
        {services.map((s, i) => {
          const Icon = ICONS[s.id]
          return (
            <div
              key={s.id}
              className={s.id === active ? 'panel active' : 'panel'}
              id={s.id}
              role="tabpanel"
              aria-labelledby={`tab-${s.id}`}
            >
              <div className="pside">
                <div className="picon">
                  <Icon />
                </div>
                <div className="pn">Área {String(i + 1).padStart(2, '0')}</div>
                <h3>{s.titulo}</h3>
                <p>{s.descricao}</p>
              </div>
              <div className="plist">
                {s.itens.map((item) => (
                  <div className="item" key={item}>
                    <span className="d">
                      <IconCheck />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </Reveal>
    </>
  )
}
