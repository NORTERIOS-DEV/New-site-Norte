import { Reveal } from '../components/Reveal'

const mvv = [
  {
    dot: 'var(--orange-600)',
    titulo: 'Missão',
    texto:
      'Atuar na gestão educacional em redes públicas e privadas, oferecendo soluções inovadoras, personalizadas e sustentáveis para potencializar pessoas na educação para a transformação geracional.',
  },
  {
    dot: 'var(--teal-500)',
    titulo: 'Visão',
    texto:
      'Ser referência positiva na transformação educacional da Amazônia, através de abordagens específicas e diferenciadas, ampliando nosso impacto em todas as regiões do Estado do Pará até 2030.',
  },
]

const valores: [string, string][] = [
  ['Excelência', 'Qualidade e aprimoramento constantes em todas as soluções.'],
  [
    'Inovação',
    'Novas ideias, soluções criativas e tecnologia para os desafios educacionais.',
  ],
  [
    'Sustentabilidade',
    'Práticas responsáveis para o bem-estar das pessoas e do meio ambiente.',
  ],
  [
    'Aprendizagem contínua em alta performance',
    'Desenvolvimento pessoal, profissional e espiritual cristão.',
  ],
  ['Comunicação assertiva', 'Comunicação clara, direta, efetiva e afetiva.'],
  [
    'Prosperidade',
    'Crescimento sustentável e desenvolvimento econômico-social inclusivo.',
  ],
]

const etapas = [
  'Diagnóstico inicial da rede',
  'Planejamento estratégico detalhado',
  'Pactuação de metas e prioridades',
  'Implementação das ações',
  'Monitoramento contínuo',
  'Ajustes e potencialização',
  'Consolidação dos resultados',
]

export function Sobre() {
  return (
    <section className="sec sobre" id="sobre" aria-label="Sobre a consultoria">
      <div className="wrap">
        <Reveal>
          <span className="eyebrow">Sobre a consultoria</span>
          <p className="sobre-lead">
            Nossa origem é a <span className="em">Amazônia.</span> Nossa missão é
            transformar a <span className="em">educação</span> da região.
          </p>
        </Reveal>

        <Reveal className="sobre-cols">
          <p>
            A Norte Rios nasceu da vivência real nos territórios da
            Transamazônica, com o propósito de resolver problemas concretos da
            gestão pública e da educação. Com a ampliação da equipe para
            especialistas em pedagogia e psicopedagogia, nos tornamos uma
            consultoria estratégica que conecta gestão, prática pedagógica e
            resultados educacionais.
          </p>
          <p>
            Hoje, atuamos apoiando redes públicas e privadas com soluções
            completas — da organização administrativa à transformação da
            aprendizagem. Acompanhamos cada projeto até que ele aconteça de
            verdade, dentro da realidade de cada município.
          </p>
        </Reveal>

        <div className="mvv">
          {mvv.map((c) => (
            <Reveal className="card" key={c.titulo}>
              <h3>
                <span className="dot" style={{ background: c.dot }} />
                {c.titulo}
              </h3>
              <p>{c.texto}</p>
            </Reveal>
          ))}

          <Reveal className="card">
            <h3>
              <span className="dot" style={{ background: 'var(--gold)' }} />
              Valores
            </h3>
            <ul className="vlist">
              {valores.map(([termo, desc]) => (
                <li key={termo}>
                  <b>{termo}</b>
                  {desc}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="metodo">
          <span className="eyebrow">Metodologia de trabalho</span>
          <h3>Um método estruturado que garante execução e resultado</h3>
          <p className="muted">
            Sete etapas que conduzem a rede do diagnóstico à consolidação.
          </p>
          <div className="steps">
            {etapas.map((texto, i) => (
              <div className="step" key={texto}>
                <span className="num">{i + 1}</span>
                <p>{texto}</p>
              </div>
            ))}
          </div>
          <p className="close">
            O trabalho não fica apenas no papel. A gente acompanha até acontecer.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
