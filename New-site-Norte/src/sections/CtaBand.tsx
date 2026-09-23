import { Reveal } from '../components/Reveal'
import { Btn } from '../components/Btn'
import { waLink, waMessages } from '../data/contact'

export function CtaBand() {
  return (
    <section className="cta-band" aria-label="Chamada para ação">
      <Reveal className="wrap">
        <h2>
          Sua rede pode alcançar melhores resultados. O primeiro passo é uma
          conversa.
        </h2>
        <p>
          Conte o desafio da sua rede — montamos um plano sob medida para a sua
          realidade.
        </p>
        <Btn href={waLink(waMessages.proposta)} variant="light" arrow>
          Solicitar proposta personalizada
        </Btn>
      </Reveal>
    </section>
  )
}
