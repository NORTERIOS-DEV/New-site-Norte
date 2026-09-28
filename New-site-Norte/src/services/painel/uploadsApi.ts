import { painelFetchJson } from './httpClient'

export async function uploadImagem(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('imagem', file)
  const { url } = await painelFetchJson<{ url: string }>('/uploads/imagem/', { method: 'POST', body: fd })
  return url
}
