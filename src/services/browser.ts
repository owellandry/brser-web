export interface BrowserLocalAction {
  label: string
  target: string
  kind: 'internal' | 'external'
}

export interface BrowserLocalDocument {
  title: string
  eyebrow: string
  body: string[]
  actions?: BrowserLocalAction[]
}

const localDocuments: Record<string, BrowserLocalDocument> = {
  'app://docs': {
    eyebrow: 'Local Docs',
    title: 'Zenit Docs',
    body: [
      'Zenit Navigator works best with internal pages, embeddable media URLs and external links opened in a new tab when a site blocks iframe access.',
      'Use the address bar for app:// routes, pasted YouTube/Vimeo links, or a web address like example.com.',
    ],
    actions: [
      { label: 'Open roadmap', target: 'app://roadmap', kind: 'internal' },
      { label: 'Read about WASM', target: 'app://wasm', kind: 'internal' },
    ],
  },
  'app://roadmap': {
    eyebrow: 'Internal Page',
    title: 'Roadmap',
    body: [
      'The browser now keeps navigation history per window, normalizes typed addresses and converts supported video URLs into embeddable pages.',
      'External pages still depend on iframe permissions from the destination site, so the app gives a clean fallback when that is not possible.',
    ],
    actions: [{ label: 'Back to docs', target: 'app://docs', kind: 'internal' }],
  },
  'app://wasm': {
    eyebrow: 'Internal Page',
    title: 'WASM Sandbox',
    body: [
      'Rust handles command parsing and path normalization while the browser shell stays in TypeScript and React.',
      'That split keeps state persistence simple while still giving us a solid runtime boundary.',
    ],
    actions: [{ label: 'Back to docs', target: 'app://docs', kind: 'internal' }],
  },
}

function normalizeInternalRoute(input: string) {
  const trimmed = input.trim()

  if (!trimmed.startsWith('app://')) {
    return trimmed
  }

  if (trimmed.startsWith('app://search?')) {
    return trimmed
  }

  const normalized = trimmed.toLowerCase()
  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized
}

function tryParseUrl(input: string) {
  try {
    return new URL(input)
  } catch {
    return null
  }
}

function convertYouTubeUrl(url: URL) {
  const host = url.hostname.replace(/^www\./, '')
  const videoId =
    host === 'youtu.be'
      ? url.pathname.split('/').filter(Boolean)[0]
      : url.searchParams.get('v') ||
        (url.pathname.startsWith('/embed/') ? url.pathname.split('/')[2] : null) ||
        (url.pathname.startsWith('/shorts/') ? url.pathname.split('/')[2] : null)

  if (!videoId) {
    return url.toString()
  }

  return `https://www.youtube.com/embed/${videoId}`
}

function convertVimeoUrl(url: URL) {
  const host = url.hostname.replace(/^www\./, '')
  const parts = url.pathname.split('/').filter(Boolean)
  const videoId =
    host === 'player.vimeo.com'
      ? parts.at(-1)
      : parts.find((part) => /^\d+$/.test(part))

  if (!videoId) {
    return url.toString()
  }

  return `https://player.vimeo.com/video/${videoId}`
}

export function normalizeBrowserInput(rawInput: string) {
  const trimmed = rawInput.trim()

  if (!trimmed) {
    return 'app://docs'
  }

  if (trimmed.startsWith('app://')) {
    return normalizeInternalRoute(trimmed)
  }

  const withProtocol =
    /^https?:\/\//i.test(trimmed) ? trimmed : /[\s]/.test(trimmed) || !trimmed.includes('.')
      ? `app://search?q=${encodeURIComponent(trimmed)}`
      : `https://${trimmed}`

  if (withProtocol.startsWith('app://')) {
    return withProtocol
  }

  const parsedUrl = tryParseUrl(withProtocol)
  if (!parsedUrl) {
    return 'app://docs'
  }

  const host = parsedUrl.hostname.replace(/^www\./, '')
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
    return convertYouTubeUrl(parsedUrl)
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    return convertVimeoUrl(parsedUrl)
  }

  return parsedUrl.toString()
}

export function getLocalDocument(location: string): BrowserLocalDocument | null {
  const normalized = normalizeInternalRoute(location)

  if (normalized.startsWith('app://search?')) {
    const searchUrl = new URL(normalized.replace('app://search', 'https://internal.zenit/search'))
    const query = searchUrl.searchParams.get('q') ?? ''

    return {
      eyebrow: 'Search',
      title: `Search for "${query}"`,
      body: [
        'Web search results are opened outside the iframe because most engines block embedding.',
        'You can still use Zenit Navigator to jump to internal pages or paste embeddable media URLs.',
      ],
      actions: query
        ? [
            {
              label: 'Search on DuckDuckGo',
              target: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
              kind: 'external',
            },
            { label: 'Back to docs', target: 'app://docs', kind: 'internal' },
          ]
        : [{ label: 'Back to docs', target: 'app://docs', kind: 'internal' }],
    }
  }

  return localDocuments[normalized] ?? null
}

export function getEmbeddableUrl(location: string) {
  const parsedUrl = tryParseUrl(location)
  if (!parsedUrl) {
    return null
  }

  const host = parsedUrl.hostname.replace(/^www\./, '')
  if (
    (host === 'youtube.com' && parsedUrl.pathname.startsWith('/embed/')) ||
    host === 'player.vimeo.com'
  ) {
    return parsedUrl.toString()
  }

  return null
}

export function isExternalLocation(location: string) {
  return /^https?:\/\//i.test(location)
}
