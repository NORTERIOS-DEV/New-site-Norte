import { contact } from './contact'
import type { Edital } from './types'

const edital0022026: Edital = {
  slug: 'edital-002-2026',
  seo: {
    title:
      'Edital Nº 002/2026 · Banco de Cadastro de Formadores(as) · Norte Rios',
    description:
      'Edital de Banco de Cadastro de Formadores(as) Nº 002/2026 — credenciamento para ações formativas da Norte Rios. Inscrições de 02/07 até 07/07.',
  },
  numero: 'Nº 002/2026',
  statusTag: 'Edital · Nº 002/2026 · Inscrições abertas',
  titulo: 'Edital de Banco de Cadastro de Formadores(as) Nº 002/2026',
  resumo:
    'Credenciamento para composição de banco de cadastro de formadores(as) para desenvolver ações formativas promovidas pela Norte Rios Gestão e Treinamentos — oficinas, cursos, seminários, palestras, jornadas pedagógicas e demais ações, presenciais e/ou on-line.',
  inscricoesLabel: 'Inscrições: 02/07 até 07/07/2026',
  inscricaoUrl: contact.formadoresUrl,
  cronograma: [
    { ato: 'Publicação do Edital', data: '02/07/2026' },
    { ato: 'Período de Inscrição', data: '02 a 07/07/2026' },
    {
      ato: 'Homologação do Banco de Cadastro de Formadores(as)',
      data: '07/07/2026',
    },
    { ato: 'Análise Curricular e Documental', data: '08/07/2026' },
    { ato: 'Entrevista e/ou vídeo de apresentação', data: '09 a 10/07/2026' },
  ],
  cronogramaNota: [
    'Divulgação dos atos: ',
    { text: contact.instagramHandle, href: contact.instagram },
  ],
  eixos: [
    {
      titulo: 'Etapas e Modalidades de Ensino',
      descricao:
        'Educação Infantil, Ensino Fundamental, EJA e Educação da Diversidade Territorial (campo, indígena, quilombola e ribeirinha).',
    },
    {
      titulo: 'Transversalidade, Inclusão e Cidadania',
      descricao:
        'Educação Especial e Inclusiva, Educação Étnico-Racial e Direitos Humanos, Sustentabilidade Socioambiental.',
    },
    {
      titulo: 'Práticas Pedagógicas, Inovação e Tecnologias',
      descricao:
        'Educação digital e IA, cultura maker, alfabetização, recomposição das aprendizagens, tempo integral.',
    },
    {
      titulo: 'Gestão Educacional, Planejamento e Financiamento',
      descricao:
        'Gestão escolar, planejamento estratégico, PME, avaliação de resultados, FUNDEB/PDDE/PAR e captação de recursos.',
    },
  ],
  requisitos: [
    'Profissionais com idade mínima de 18 anos;',
    'Graduados(as) e Pós-Graduados(as) em Educação e áreas relacionadas aos eixos temáticos;',
    'Com experiência comprovada em atividades formativas;',
    'Com domínio em pelo menos uma das áreas temáticas do edital;',
    'Com disponibilidade para viagens, quando necessário, e familiaridade com tecnologias de ensino remoto.',
  ],
  requisitosNota: [
    'Vigência do edital: 12 (doze) meses, a contar da data de assinatura. Comunicação oficial: ',
    {
      text: contact.emailFormadores,
      href: `mailto:${contact.emailFormadores}`,
    },
    '.',
  ],
  documentos: [
    {
      titulo: 'Edital completo Nº 002/2026',
      arquivo: 'docs/edital-002-2026.pdf',
      tamanho: 'PDF · 308 KB',
      icon: 'file',
    },
    {
      titulo: 'Anexo I — Cronograma de Execução',
      arquivo: 'docs/anexo-i-cronograma-de-execucao.pdf',
      tamanho: 'PDF · 97 KB',
      icon: 'calendar',
    },
    {
      titulo: 'Anexo II — Modelo de Currículo',
      arquivo: 'docs/anexo-ii-modelo-de-curriculo.pdf',
      tamanho: 'PDF · 116 KB',
      icon: 'curriculo',
    },
    {
      titulo: 'Anexo III — Declaração de Disponibilidade',
      arquivo: 'docs/anexo-iii-declaracao-de-disponibilidade.pdf',
      tamanho: 'PDF · 92 KB',
      icon: 'check',
    },
    {
      titulo: 'Anexo IV — Termo de Consentimento (LGPD) e Uso de Imagem',
      arquivo: 'docs/anexo-iv-termo-de-consentimento-lgpd.pdf',
      tamanho: 'PDF · 115 KB',
      icon: 'lgpd',
    },
  ],
  documentosNota:
    'Os arquivos abrem em nova aba ou são baixados automaticamente, conforme o navegador.',
}

export const editais: Record<string, Edital> = {
  [edital0022026.slug]: edital0022026,
}

export function getEdital(slug: string | undefined): Edital | undefined {
  return slug ? editais[slug] : undefined
}
