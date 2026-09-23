import { Reveal } from '../components/Reveal'
import { Marquee } from '../components/Marquee'
import { IconCheck } from '../components/icons'

const resultados = [
  'Melhoria da infraestrutura escolar',
  'Mais acesso a recursos didáticos',
  'Professores mais preparados e confiantes',
  'Redução da evasão escolar',
  'Aumento da qualidade do ensino',
  'Projetos pedagógicos inovadores implementados',
  'Avanço nos indicadores educacionais',
  'Ambientes escolares mais saudáveis e inclusivos',
]

const municipios = [
  'São Félix do Xingu',
  'Marituba',
  'Canaã dos Carajás',
  'Tucuruí',
  'Prainha',
  'Terra Santa',
  'Bom Jesus do Tocantins',
  'Eldorado dos Carajás',
  'Itupiranga',
  'Trairão',
  'Salvaterra',
  'Uruará',
  'Placas',
  'Senador José Porfírio',
  'Pacajá',
  'Brasil Novo',
]

const parceiros = ['FIEPA', 'Norte Energia', 'Mídias Educativas', 'Synergia']

export function ProvaSocial() {
  return (
    <section className="sec" aria-label="Resultados e confiança">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="eyebrow">Prova social</span>
          <h2>Resultados que entregamos na prática</h2>
        </Reveal>

        <div className="results">
          {resultados.map((r) => (
            <Reveal className="res" key={r}>
              <span className="chk">
                <IconCheck />
              </span>
              <span>{r}</span>
            </Reveal>
          ))}
        </div>

        <Reveal className="trust">
          <h3>Quem já confia na Norte Rios</h3>
          <p className="muted">
            Diversos municípios e instituições do Pará e da Amazônia.
          </p>
          <Marquee items={municipios} />
          <div className="partners">
            {parceiros.map((p) => (
              <span className="partner" key={p}>
                {p}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
