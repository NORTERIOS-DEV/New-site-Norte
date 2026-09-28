/** Único lugar a editar quando o backend ganhar novos status (agendado,
 * arquivado, em revisão, ...) - blog/models.py Post.STATUS_CHOICES. */
export const POST_STATUS_OPTIONS = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'publicado', label: 'Publicado' },
] as const
