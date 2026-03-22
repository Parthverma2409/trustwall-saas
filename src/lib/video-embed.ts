/**
 * Converts a video URL (YouTube, Vimeo, Loom) into an embeddable iframe URL.
 * Returns null if the URL is not a recognized video platform.
 */
export function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)

    // YouTube
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      let videoId: string | null = null
      if (u.hostname.includes('youtu.be')) {
        videoId = u.pathname.slice(1)
      } else {
        videoId = u.searchParams.get('v')
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }

    // Vimeo
    if (u.hostname.includes('vimeo.com')) {
      const match = u.pathname.match(/\/(\d+)/)
      if (match) {
        return `https://player.vimeo.com/video/${match[1]}`
      }
    }

    // Loom
    if (u.hostname.includes('loom.com')) {
      const match = u.pathname.match(/\/share\/([a-zA-Z0-9]+)/)
      if (match) {
        return `https://www.loom.com/embed/${match[1]}`
      }
    }

    return null
  } catch {
    return null
  }
}
