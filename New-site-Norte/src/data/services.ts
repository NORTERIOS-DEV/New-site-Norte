import type { ServiceArea } from './types'

export const services: ServiceArea[] = [
  {
    id: 'adm',
    aba: 'Administrativo',
    titulo: 'Administrativo',
    descricao:
      'Organizamos a base da gestão educacional para que tudo funcione com segurança e eficiência.',
    itens: [
      'Adequação às legislações',
      'Estruturação administrativa da SEMED',
      'Revisão de PCCR e processos de contratação',
      'Organização de fluxos e rotinas',
      'Elaboração de normativas oficiais',
      'Estratégias de matrícula e busca ativa',
    ],
  },
  {
    id: 'ped',
    aba: 'Pedagógico',
    titulo: 'Pedagógico',
    descricao: 'Fortalecemos o que mais importa: o aprendizado e quem o conduz.',
    itens: [
      'Educação Infantil com foco em desenvolvimento integral',
      'Ensino Fundamental com melhoria de desempenho',
      'Educação Integral e ampliação da jornada',
      'EJA com foco em permanência e sucesso',
      'Educação Inclusiva com acessibilidade real',
      'Revisão curricular e organização pedagógica',
      'Planos de ação e formação continuada de professores',
    ],
  },
  {
    id: 'fin',
    aba: 'Orçamentário & Financeiro',
    titulo: 'Orçamentário & Financeiro',
    descricao: 'Transformamos recursos em resultados educacionais.',
    itens: [
      'Captação estratégica de recursos',
      'Planejamento financeiro da educação',
      'Projeções e cenários orçamentários',
      'Relatórios para tomada de decisão',
    ],
  },
  {
    id: 'sis',
    aba: 'Sistemas & Programas',
    titulo: 'Sistemas & Programas',
    descricao:
      'Evite bloqueios e perda de recursos com acompanhamento técnico.',
    itens: [
      'Gestão de programas (PAR, SIMEC, PDDE, PNAE, PNATE etc.)',
      'Regularização cadastral e operacional',
      'Monitoramento de prazos e obrigações',
      'Relatórios técnicos e acompanhamento contínuo',
    ],
  },
]
