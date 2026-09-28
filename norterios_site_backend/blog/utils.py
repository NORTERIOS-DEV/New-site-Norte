WORDS_PER_MINUTE = 200


def _extract_text(node, chunks):
    if not isinstance(node, dict):
        return
    text = node.get('text')
    if isinstance(text, str):
        chunks.append(text)
    for child in node.get('content') or []:
        _extract_text(child, chunks)


def estimate_reading_time(conteudo_json):
    """Estima o tempo de leitura (minutos) a partir do doc JSON do TipTap.

    Usado apenas como fallback em Post.save() quando o campo não veio
    preenchido explicitamente pelo formulário do painel.
    """
    if not conteudo_json:
        return None
    chunks = []
    _extract_text(conteudo_json, chunks)
    word_count = len(' '.join(chunks).split())
    if word_count == 0:
        return None
    return max(1, round(word_count / WORDS_PER_MINUTE))
