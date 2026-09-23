import { Seo } from '../components/Seo'
import { Reveal } from '../components/Reveal'
import { PublicationCard } from '../components/PublicationCard'
import { publicacoes } from '../data/publications'

export function PublicacoesPage() {
  return (
    <>
      <Seo
        title="Publicações · Norte Rios"
        description="Editais, credenciamentos e comunicados oficiais da Norte Rios Gestão e Treinamentos."
      />

      <section className="sec" style={{ paddingBottom: 40 }}>
        <div className="wrap">
          <Reveal className="sec-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">Publicações</span>
            <h2>Editais e comunicados oficiais</h2>
            <p className="lead">
              Acompanhe aqui todas as publicações da Norte Rios — editais,
              credenciamentos e oportunidades para formadores(as) e parceiros.
            </p>
          </Reveal>
        </div>
      </section>

      <section
        className="sec pubs"
        id="lista"
        style={{ paddingTop: 40 }}
        aria-label="Lista de publicações"
      >
        <div className="wrap" style={{ display: 'grid', gap: 28 }}>
          {publicacoes.map((p) => (
            <PublicationCard key={p.slug} pub={p} />
          ))}
        </div>
      </section>
    </>
  )
}
