import type { ComponentType } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Reveal } from '../components/Reveal'
import { Btn } from '../components/Btn'
import { RichText } from '../components/RichText'
import { NotFoundPage } from './NotFoundPage'
import { getEdital } from '../data/editais'
import type { DocIcon } from '../data/types'
import '../styles/edital.css'
import {
  IconArrow,
  IconCalendar,
  IconCheckThin,
  IconClock,
  IconBook,
  IconUsers,
  IconUser,
  IconFile,
  IconLock,
  IconDownload,
} from '../components/icons'

const DOC_ICONS: Record<DocIcon, ComponentType<{ className?: string }>> = {
  file: IconFile,
  calendar: IconCalendar,
  curriculo: IconUser,
  check: IconCheckThin,
  lgpd: IconLock,
}

export function EditalPage() {
  const { slug } = useParams()
  const edital = getEdital(slug)

  if (!edital) return <NotFoundPage />

  return (
    <>
      <Seo title={edital.seo.title} description={edital.seo.description} />

      <section className="ed-hero" aria-label={`Edital ${edital.numero}`}>
        <div className="wrap">
          <Reveal>
            <Link
              to="/publicacoes"
              className="eyebrow"
              style={{ cursor: 'pointer' }}
            >
              ← Publicações
            </Link>
            <span
              className="ptag"
              style={{ display: 'inline-block', margin: '0 0 16px' }}
            >
              {edital.statusTag}
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.7rem,3.6vw,2.6rem)',
                maxWidth: 900,
              }}
            >
              {edital.titulo}
            </h2>
            <p
              className="lead"
              style={{
                color: 'var(--ink-soft)',
                fontSize: '1.12rem',
                marginTop: 16,
                maxWidth: 820,
              }}
            >
              {edital.resumo}
            </p>
            <div className="ed-actions">
              <span className="pdates">
                <IconCalendar />
                {edital.inscricoesLabel}
              </span>
              <Btn href={edital.inscricaoUrl} arrow>
                Inscreva-se agora
              </Btn>
              <a
                className="ed-link"
                href={edital.inscricaoUrl}
                target="_blank"
                rel="noopener"
              >
                {edital.inscricaoUrl}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className="sec"
        style={{ paddingTop: 56 }}
        aria-label="Informações do edital"
      >
        <div className="wrap">
          <div className="ed-grid">
            <div style={{ display: 'grid', gap: 26 }}>
              <Reveal className="ed-card">
                <h3>
                  <IconClock />
                  Cronograma de execução
                </h3>
                <table className="crono">
                  <thead>
                    <tr>
                      <th>Ato</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {edital.cronograma.map((row) => (
                      <tr key={row.ato}>
                        <td>{row.ato}</td>
                        <td className="dt">{row.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="note">
                  <RichText
                    parts={edital.cronogramaNota}
                    linkClassName="ed-link"
                  />
                </p>
              </Reveal>

              <Reveal className="ed-card">
                <h3>
                  <IconBook />
                  Eixos temáticos
                </h3>
                <div className="eixos">
                  {edital.eixos.map((e, i) => (
                    <div className="eixo" key={e.titulo}>
                      <b>
                        {i + 1}. {e.titulo}
                      </b>
                      <span>{e.descricao}</span>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal className="ed-card">
                <h3>
                  <IconUsers />
                  Quem pode se inscrever
                </h3>
                <ul className="req">
                  {edital.requisitos.map((r) => (
                    <li key={r}>
                      <IconCheckThin />
                      {r}
                    </li>
                  ))}
                </ul>
                <p className="note">
                  <RichText
                    parts={edital.requisitosNota}
                    linkClassName="ed-link"
                  />
                </p>
              </Reveal>
            </div>

            <div style={{ display: 'grid', gap: 26 }}>
              <Reveal className="ed-card" id="documentos">
                <h3>
                  <IconFile />
                  Documentos do edital
                </h3>
                <div className="doc-list">
                  {edital.documentos.map((doc) => {
                    const DocIconEl = DOC_ICONS[doc.icon]
                    return (
                      <a
                        className="doc"
                        key={doc.arquivo}
                        href={`/${doc.arquivo}`}
                        target="_blank"
                        rel="noopener"
                        download
                      >
                        <span className="di">
                          <DocIconEl />
                        </span>
                        <span>
                          <b>{doc.titulo}</b>
                          <small>{doc.tamanho}</small>
                        </span>
                        <span className="dl">
                          <IconDownload />
                        </span>
                      </a>
                    )
                  })}
                </div>
                <p className="note">{edital.documentosNota}</p>
              </Reveal>
            </div>
          </div>

          <Reveal className="ins-band">
            <div>
              <h3>Inscrições exclusivamente on-line</h3>
              <p>
                Acesse o site oficial, preencha os dados e anexe os documentos em
                PDF:
              </p>
              <a
                className="url"
                href={edital.inscricaoUrl}
                target="_blank"
                rel="noopener"
              >
                {edital.inscricaoUrl}
              </a>
            </div>
            <a
              className="btn btn--light"
              href={edital.inscricaoUrl}
              target="_blank"
              rel="noopener"
            >
              Inscreva-se agora
              <IconArrow />
            </a>
          </Reveal>
        </div>
      </section>
    </>
  )
}
