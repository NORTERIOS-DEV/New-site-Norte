import { Btn } from '../components/Btn'
import { Sun, RiverWaves } from '../components/HeroArt'
import { waLink, waMessages } from '../data/contact'

export function Hero() {
  return (
    <section className="hero" aria-label="Apresentação">
      <Sun />
      <div className="wrap hero-inner">
        <span className="eyebrow">Consultoria educacional · Amazônia</span>
        <h1>
          Transformamos desafios da educação em{' '}
          <span className="hl">resultados reais.</span>
        </h1>
        <p className="sub">
          A Norte Rios ajuda redes públicas e privadas a organizar a gestão,
          fortalecer professores e implementar práticas pedagógicas que melhoram
          o ensino, os indicadores e o uso dos recursos.
        </p>
        <div className="hero-actions">
          <Btn href={waLink(waMessages.reuniao)} arrow>
            Agendar reunião
          </Btn>
          <Btn to="#servicos" variant="ghost">
            Ver serviços
          </Btn>
        </div>
      </div>
      <RiverWaves />
    </section>
  )
}
