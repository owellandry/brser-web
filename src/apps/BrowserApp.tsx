import { useEffect, useState } from 'react'
import { ExternalLink, Globe2 } from 'lucide-react'
import { useOSStore } from '../store/osStore'

const localDocuments: Record<string, { title: string; body: string[] }> = {
  'app://docs': {
    title: 'BrserOS Docs',
    body: [
      'This internal navigator is designed for local documentation and known embeddable destinations.',
      'Use Terminal commands like `open /Home/Notes/Field Notes.md` or `open app://roadmap` to move across the OS.',
    ],
  },
  'app://roadmap': {
    title: 'Roadmap',
    body: [
      'v1 ships with a desktop shell, window manager, IndexedDB persistence and a Rust/WASM command parser.',
      'Next steps can add package installs, more apps and cloud sync without throwing away the local-first model.',
    ],
  },
  'app://wasm': {
    title: 'WASM Sandbox',
    body: [
      'Rust handles path normalization and command parsing so the frontend stays lean and easier to audit.',
      'All real persistence still lives in TypeScript + IndexedDB, which keeps the WASM boundary pure.',
    ],
  },
}

function isEmbeddableUrl(location: string) {
  return (
    location.startsWith('https://www.youtube.com/embed/') ||
    location.startsWith('https://player.vimeo.com/video/')
  )
}

interface BrowserAppProps {
  windowId: string
}

export function BrowserApp({ windowId }: BrowserAppProps) {
  const windowState = useOSStore((state) => state.windows.find((window) => window.id === windowId))
  const updateWindowPayload = useOSStore((state) => state.updateWindowPayload)

  const currentLocation =
    windowState && typeof windowState.payload.location === 'string'
      ? windowState.payload.location
      : 'app://docs'
  const [draftLocation, setDraftLocation] = useState(currentLocation)

  useEffect(() => {
    setDraftLocation(currentLocation)
  }, [currentLocation])

  if (!windowState) {
    return null
  }

  const documentPage = localDocuments[currentLocation]

  return (
    <section className="app-surface">
      <form
        className="app-toolbar"
        onSubmit={(event) => {
          event.preventDefault()
          updateWindowPayload(windowId, { location: draftLocation.trim() || 'app://docs' })
        }}
      >
        <input
          className="browser-input mono"
          value={draftLocation}
          onChange={(event) => setDraftLocation(event.target.value)}
          aria-label="Navigator address"
        />
        <button className="pill-button is-accent" type="submit">
          <Globe2 size={16} />
          Go
        </button>
      </form>

      {documentPage ? (
        <section className="browser-frame browser-doc">
          <h2>{documentPage.title}</h2>
          {documentPage.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="app-toolbar">
            {Object.keys(localDocuments).map((url) => (
              <button
                key={url}
                className={`segment-button ${currentLocation === url ? 'is-active' : ''}`}
                onClick={() => {
                  setDraftLocation(url)
                  updateWindowPayload(windowId, { location: url })
                }}
              >
                {url.replace('app://', '')}
              </button>
            ))}
          </div>
        </section>
      ) : isEmbeddableUrl(currentLocation) ? (
        <div className="browser-frame">
          <iframe title="Embedded destination" src={currentLocation} allowFullScreen />
        </div>
      ) : (
        <section className="browser-frame browser-fallback">
          <div>
            <h2>Embedding blocked by policy</h2>
            <p className="muted">
              This navigator only allows local docs and explicitly embeddable URLs such as YouTube
              embed links. Regular sites often deny iframe access via CSP or X-Frame-Options.
            </p>
            <a className="pill-button is-accent" href={currentLocation} rel="noreferrer" target="_blank">
              <ExternalLink size={16} />
              Open in a new tab
            </a>
          </div>
        </section>
      )}
    </section>
  )
}
