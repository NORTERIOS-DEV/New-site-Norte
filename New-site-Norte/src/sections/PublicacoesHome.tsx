import { Reveal } from '../components/Reveal'
import { PublicationCard } from '../components/PublicationCard'
import { publicacoes } from '../data/publications'

export function PublicacoesHome() {
  return (
    <section className="sec pubs" id="publicacoes" aria-label="Publicações">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">Publicações</span>
          <h2>Editais e comunicados oficiais</h2>
          <p className="lead">
            Acompanhe aqui as publicações da Norte Rios — editais,
            credenciamentos e oportunidades.
          </p>
        </Reveal>

        <PublicationCard pub={publicacoes[0]} showAllLink />
      </div>
    </section>
  )
}
