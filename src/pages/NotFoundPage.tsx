import { Seo } from '../components/Seo'
import { Btn } from '../components/Btn'

export function NotFoundPage() {
  return (
    <>
      <Seo
        title="Página não encontrada · Norte Rios"
        description="A página que você procura não existe ou foi movida."
      />
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Erro 404</span>
            <h2>Página não encontrada</h2>
            <p className="lead">
              O endereço que você acessou não existe ou foi movido.
            </p>
          </div>
          <Btn to="/" arrow>
            Voltar para o início
          </Btn>
        </div>
      </section>
    </>
  )
}
