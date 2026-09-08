export const contact = {
  phone: '5591993354210',
  phoneDisplay: '(91) 99335-4210',
  tel: 'tel:+5591993354210',
  email: 'contato@norterios.com.br',
  emailFormadores: 'cadastro.formadores@norterios.com.br',
  instagram: 'https://www.instagram.com/norterios.oficial/',
  instagramHandle: '@norterios.oficial',
  site: 'https://norterios.com.br',
  siteDisplay: 'norterios.com.br',
  address:
    'Ed. Vitta Office · Av. Rômulo Maiorana, 700, sala 506 — Marco, Belém — PA',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Ed.%20Vitta%20Office%20Av.%20R%C3%B4mulo%20Maiorana%20700%20Marco%20Bel%C3%A9m%20PA%2066093-672',
  formadoresUrl: 'https://formadores.norterios.com.br/',
}

/** Mensagens pré-preenchidas para os links de WhatsApp. */
export const waMessages = {
  reuniao: 'Olá! Gostaria de agendar uma reunião com a Norte Rios.',
  falar: 'Olá! Gostaria de falar com a Norte Rios.',
  proposta:
    'Olá! Gostaria de solicitar uma proposta personalizada da Norte Rios.',
}

export function waLink(message: string): string {
  return `https://wa.me/${contact.phone}?text=${encodeURIComponent(message)}`
}
