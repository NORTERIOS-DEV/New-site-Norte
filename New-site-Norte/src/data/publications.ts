import cover from '../assets/edital-002-2026-cover.png'
import coverMobile from '../assets/edital-002-2026-cover-mobile.png'
import type { Publicacao } from './types'

/**
 * Lista de publicações oficiais. Para adicionar uma nova, basta incluir um item
 * aqui (e, se for um edital com página própria, um objeto em `data/editais.ts`).
 * A mais recente aparece em destaque na home.
 */
export const publicacoes: Publicacao[] = [
  {
    slug: 'edital-002-2026',
    selo: 'Edital · Nº 002/2026',
    titulo: 'Edital de Banco de Cadastro de Formadores(as) Nº 002/2026',
    descricao:
      'Credenciamento para composição de banco de cadastro de formadores(as) para desenvolver ações formativas promovidas pela Norte Rios Gestão e Treinamentos.',
    datasLabel: 'Inscrições: 02/07 até 07/07',
    coverAlt:
      'Banner do Edital de Banco de Cadastro de Formadores Nº 002/2026 — inscrições de 02/07 até 07/07',
    cover,
    coverMobile,
    ctaLabel: 'Quero me inscrever',
  },
]
