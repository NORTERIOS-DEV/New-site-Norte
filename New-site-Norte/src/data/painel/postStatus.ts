/** Único lugar a editar quando o backend ganhar novos status (arquivado, em
 * revisão, ...) - blog/models.py Post.STATUS_CHOICES.
 *
 * "agendado" é um valor aceito pelo serializer do painel mas nunca persistido
 * em `status` - o backend traduz pra `publicado` com `data_publicacao`
 * futura e recupera o estado via `status_efetivo` (ver
 * PostPainelSerializer.validate() em blog/serializers_painel.py). */
export const POST_STATUS_OPTIONS = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'agendado', label: 'Agendado' },
] as const
