type DedupePost = {
  id: string
  title: string
  body?: string | null
  embedUrl?: string | null
}

function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url)
    return `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname}`.replace(/\/+$/, '').toLowerCase()
  } catch {
    return url.trim().toLowerCase()
  }
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function dedupePostsByContent<T extends object>(items: T[]) {
  const seen = new Set<string>()
  const unique: T[] = []

  for (const item of items) {
    const post = item as T & DedupePost
    const key = post.embedUrl
      ? `url:${normalizeUrl(post.embedUrl)}`
      : `title:${normalizeText(post.title)}`

    if (seen.has(key)) continue
    seen.add(key)
    unique.push(item)
  }

  return unique
}
