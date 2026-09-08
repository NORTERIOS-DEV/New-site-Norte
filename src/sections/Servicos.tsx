import { Reveal } from '../components/Reveal'
import { ServiceTabs } from '../components/ServiceTabs'

export function Servicos() {
  return (
    <section className="sec" id="servicos" aria-label="Serviços">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">Serviços</span>
          <h2>Soluções completas para a sua rede</h2>
          <p className="lead">
            Da base administrativa à transformação da aprendizagem — escolha uma
            frente para explorar.
          </p>
        </Reveal>

        <ServiceTabs />
      </div>
    </section>
  )
}
