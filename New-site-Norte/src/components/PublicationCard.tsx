import { Reveal } from './Reveal'
import { Btn } from './Btn'
import { IconCalendar } from './icons'
import type { Publicacao } from '../data/types'

export function PublicationCard({
  pub,
  showAllLink = false,
}: {
  pub: Publicacao
  showAllLink?: boolean
}) {
  return (
    <Reveal as="article" className="pub">
      <div className="pcover">
        <picture>
          <source media="(max-width:760px)" srcSet={pub.coverMobile} />
          <img src={pub.cover} alt={pub.coverAlt} loading="lazy" />
        </picture>
      </div>
      <div className="pbody">
        <span className="ptag">{pub.selo}</span>
        <h3>{pub.titulo}</h3>
        <p className="pdesc">{pub.descricao}</p>
        <span className="pdates">
          <IconCalendar />
          {pub.datasLabel}
        </span>
        <div className="pactions">
          <Btn to={`/publicacoes/${pub.slug}`} arrow>
            {pub.ctaLabel}
          </Btn>
          {showAllLink && (
            <Btn to="/publicacoes" variant="ghost">
              Ver todas as publicações
            </Btn>
          )}
        </div>
      </div>
    </Reveal>
  )
}
