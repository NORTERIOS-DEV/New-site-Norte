import { Seo } from '../components/Seo'
import { Hero } from '../sections/Hero'
import { Problemas } from '../sections/Problemas'
import { Diferenciais } from '../sections/Diferenciais'
import { ProvaSocial } from '../sections/ProvaSocial'
import { CtaBand } from '../sections/CtaBand'
import { Sobre } from '../sections/Sobre'
import { Servicos } from '../sections/Servicos'

export function HomePage() {
  return (
    <>
      <Seo
        title="Norte Rios · Gestão e Treinamentos em Educação"
        description="A Norte Rios ajuda redes públicas e privadas a organizar a gestão, fortalecer professores e implementar práticas pedagógicas que melhoram o ensino, os indicadores e o uso dos recursos."
      />
      <Hero />
      <Problemas />
      <Diferenciais />
      <ProvaSocial />
      <CtaBand />
      <Sobre />
      <Servicos />
    </>
  )
}
