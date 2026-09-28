export type VideoProvider = 'youtube' | 'vimeo'

export type ParsedVideoUrl = {
  provider: VideoProvider
  videoId: string
}

const YOUTUBE_PATTERN = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
const VIMEO_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/

export function parseVideoUrl(url: string): ParsedVideoUrl | null {
  const youtubeMatch = url.match(YOUTUBE_PATTERN)
  if (youtubeMatch) return { provider: 'youtube', videoId: youtubeMatch[1] }

  const vimeoMatch = url.match(VIMEO_PATTERN)
  if (vimeoMatch) return { provider: 'vimeo', videoId: vimeoMatch[1] }

  return null
}

export function embedUrlFor(provider: VideoProvider, videoId: string): string {
  if (provider === 'youtube') return `https://www.youtube-nocookie.com/embed/${videoId}`
  return `https://player.vimeo.com/video/${videoId}`
}
