import { describe, expect, it } from 'vitest'
import {
  getEmbeddableUrl,
  getLocalDocument,
  isExternalLocation,
  normalizeBrowserInput,
} from './browser'

describe('browser navigation helpers', () => {
  it('normalizes bare domains into https urls', () => {
    expect(normalizeBrowserInput('example.com')).toBe('https://example.com/')
  })

  it('converts youtube watch urls into embed urls', () => {
    expect(normalizeBrowserInput('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    )
  })

  it('creates an internal search route for plain queries', () => {
    expect(normalizeBrowserInput('react browser ui')).toBe('app://search?q=react%20browser%20ui')
  })

  it('exposes internal documents and supported embed detection', () => {
    expect(getLocalDocument('app://docs')?.title).toBe('Zenit Docs')
    expect(getEmbeddableUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    )
    expect(isExternalLocation('https://example.com')).toBe(true)
  })
})
