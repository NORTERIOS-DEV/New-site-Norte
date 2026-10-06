from django.core.exceptions import ValidationError

ALLOWED_NODE_TYPES = {
    'doc', 'paragraph', 'text', 'heading', 'bulletList', 'orderedList', 'listItem',
    'blockquote', 'horizontalRule', 'hardBreak', 'image', 'table', 'tableRow',
    'tableHeader', 'tableCell', 'videoEmbed',
}
ALLOWED_MARK_TYPES = {'bold', 'italic', 'underline', 'link', 'textStyle'}


def validate_tiptap_document(node):
    """Percorre recursivamente o doc JSON do TipTap e rejeita qualquer tipo de
    node/mark fora da allowlist - defesa contra um payload manual (bypassando
    o editor) injetar um tipo desconhecido que o `generateHTML` do front possa
    vir a renderizar de forma inesperada."""
    if node is None:
        return
    if not isinstance(node, dict):
        raise ValidationError('Conteúdo inválido.')

    node_type = node.get('type')
    if node_type is not None and node_type not in ALLOWED_NODE_TYPES:
        raise ValidationError(f'Tipo de conteúdo não permitido: {node_type!r}.')

    for mark in node.get('marks') or []:
        mark_type = mark.get('type') if isinstance(mark, dict) else None
        if mark_type not in ALLOWED_MARK_TYPES:
            raise ValidationError(f'Formatação não permitida: {mark_type!r}.')

    for child in node.get('content') or []:
        validate_tiptap_document(child)


def contem_imagem_sem_alt(node):
    """True se alguma imagem no doc JSON do TipTap não tem texto alternativo
    preenchido - usado para bloquear a publicação até o autor corrigir."""
    if not isinstance(node, dict):
        return False

    if node.get('type') == 'image':
        alt = (node.get('attrs') or {}).get('alt')
        if not alt or not str(alt).strip():
            return True

    for child in node.get('content') or []:
        if contem_imagem_sem_alt(child):
            return True

    return False
