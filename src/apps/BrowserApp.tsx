import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Globe2,
  Home,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'
import { useOSStore } from '../store/osStore'
import {
  getEmbeddableUrl,
  getLocalDocument,
  isExternalLocation,
  normalizeBrowserInput,
} from '../services/browser'

interface BrowserAppProps {
  windowId: string
}

interface BrowserPayloadShape {
  location?: string
  history?: string[]
  historyIndex?: number
  reloadToken?: number
}

function readBrowserPayload(payload: Record<string, unknown>): Required<BrowserPayloadShape> {
  const location = typeof payload.location === 'string' ? payload.location : 'app://docs'
  const history = Array.isArray(payload.history)
    ? payload.history.filter((entry): entry is string => typeof entry === 'string')
    : [location]
  const historyIndex =
    typeof payload.historyIndex === 'number' &&
    payload.historyIndex >= 0 &&
    payload.historyIndex < history.length
      ? payload.historyIndex
      : Math.max(0, history.length - 1)

  return {
    location,
    history,
    historyIndex,
    reloadToken: typeof payload.reloadToken === 'number' ? payload.reloadToken : 0,
  }
}

export function BrowserApp({ windowId }: BrowserAppProps) {
  const windowState = useOSStore((state) => state.windows.find((window) => window.id === windowId))
  const updateWindowPayload = useOSStore((state) => state.updateWindowPayload)
  const [draftLocation, setDraftLocation] = useState('app://docs')
  const [frameStatus, setFrameStatus] = useState<'idle' | 'loading' | 'ready'>('idle')

  const browserPayload = useMemo(() => {
    if (!windowState) {
      return {
        location: 'app://docs',
        history: ['app://docs'],
        historyIndex: 0,
        reloadToken: 0,
      }
    }

    return readBrowserPayload(windowState.payload as Record<string, unknown>)
  }, [windowState])

  const currentLocation = browserPayload.location
  const history = browserPayload.history
  const historyIndex = browserPayload.historyIndex
  const canGoBack = historyIndex > 0
  const canGoForward = historyIndex < history.length - 1
  const localDocument = getLocalDocument(currentLocation)
  const embeddableUrl = getEmbeddableUrl(currentLocation)
  const isExternal = isExternalLocation(currentLocation)

  useEffect(() => {
    setDraftLocation(currentLocation)
  }, [currentLocation])

  useEffect(() => {
    if (!windowState) {
      return
    }

    if (
      history.length === 0 ||
      history[historyIndex] !== currentLocation ||
      !Array.isArray(windowState.payload.history)
    ) {
      updateWindowPayload(windowId, {
        location: currentLocation,
        history,
        historyIndex,
        reloadToken: browserPayload.reloadToken,
      })
    }
  }, [
    browserPayload.reloadToken,
    currentLocation,
    history,
    historyIndex,
    updateWindowPayload,
    windowId,
    windowState,
  ])

  useEffect(() => {
    if (embeddableUrl) {
      setFrameStatus('loading')
      return
    }

    setFrameStatus('idle')
  }, [browserPayload.reloadToken, embeddableUrl])

  if (!windowState) {
    return null
  }

  function commitNavigation(rawInput: string, mode: 'push' | 'replace' = 'push') {
    const nextLocation = normalizeBrowserInput(rawInput)

    if (mode === 'replace') {
      const nextHistory = [...history]
      nextHistory[historyIndex] = nextLocation
      updateWindowPayload(windowId, {
        location: nextLocation,
        history: nextHistory,
        historyIndex,
      })
      return
    }

    if (nextLocation === currentLocation) {
      updateWindowPayload(windowId, {
        reloadToken: browserPayload.reloadToken + 1,
      })
      return
    }

    const nextHistory = history.slice(0, historyIndex + 1)
    nextHistory.push(nextLocation)

    updateWindowPayload(windowId, {
      location: nextLocation,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    })
  }

  function moveInHistory(direction: -1 | 1) {
    const nextIndex = historyIndex + direction
    if (nextIndex < 0 || nextIndex >= history.length) {
      return
    }

    updateWindowPayload(windowId, {
      location: history[nextIndex],
      historyIndex: nextIndex,
    })
  }

  return (
    <section className="app-surface">
      <div className="browser-toolbar-shell">
        <div className="app-toolbar browser-toolbar">
          <button
            className="ghost-button"
            aria-label="Go back"
            disabled={!canGoBack}
            onClick={() => moveInHistory(-1)}
          >
            <ArrowLeft size={16} />
          </button>
          <button
            className="ghost-button"
            aria-label="Go forward"
            disabled={!canGoForward}
            onClick={() => moveInHistory(1)}
          >
            <ArrowRight size={16} />
          </button>
          <button className="ghost-button" aria-label="Go home" onClick={() => commitNavigation('app://docs')}>
            <Home size={16} />
          </button>
          <button
            className="ghost-button"
            aria-label="Reload page"
            onClick={() =>
              updateWindowPayload(windowId, {
                reloadToken: browserPayload.reloadToken + 1,
              })
            }
          >
            <RefreshCw size={16} />
          </button>

          <form
            className="browser-address-form"
            onSubmit={(event) => {
              event.preventDefault()
              commitNavigation(draftLocation)
            }}
          >
            <input
              className="browser-input mono"
              value={draftLocation}
              onChange={(event) => setDraftLocation(event.target.value)}
              aria-label="Navigator address"
              placeholder="Enter app://docs, example.com, youtube.com/watch?v=..."
            />
            <button className="pill-button is-accent" type="submit">
              <Globe2 size={16} />
              Go
            </button>
          </form>
        </div>

        <div className="browser-meta-row">
          <span className="status-chip mono">{currentLocation}</span>
          <span className="status-chip">
            {localDocument
              ? 'Internal page'
              : embeddableUrl
                ? frameStatus === 'loading'
                  ? 'Loading embed'
                  : 'Embedded content'
                : isExternal
                  ? 'External site'
                  : 'Navigator'}
          </span>
        </div>
      </div>

      {localDocument ? (
        <section className="browser-frame browser-doc">
          <p className="browser-eyebrow">{localDocument.eyebrow}</p>
          <h2>{localDocument.title}</h2>
          {localDocument.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          {localDocument.actions?.length ? (
            <div className="browser-action-grid">
              {localDocument.actions.map((action) =>
                action.kind === 'internal' ? (
                  <button
                    key={`${action.kind}-${action.target}`}
                    className="segment-button"
                    onClick={() => commitNavigation(action.target)}
                  >
                    {action.label}
                  </button>
                ) : (
                  <a
                    key={`${action.kind}-${action.target}`}
                    className="segment-button"
                    href={action.target}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {action.label}
                  </a>
                ),
              )}
            </div>
          ) : null}
        </section>
      ) : embeddableUrl ? (
        <div className="browser-frame">
          <iframe
            key={`${embeddableUrl}-${browserPayload.reloadToken}`}
            title="Embedded destination"
            src={embeddableUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setFrameStatus('ready')}
          />
        </div>
      ) : (
        <section className="browser-frame browser-fallback">
          <div className="browser-fallback-card">
            <ShieldAlert size={20} />
            <h2>This page cannot be shown inside Zenit</h2>
            <p className="muted">
              The destination site is blocking iframe embedding with browser security headers like
              CSP or X-Frame-Options. That limitation comes from the site itself, not from your URL.
              Zenit can still keep history, open supported embeds and send the page to a real
              browser tab when needed.
            </p>
            <div className="browser-action-grid">
              <a className="pill-button is-accent" href={currentLocation} rel="noreferrer" target="_blank">
                <ExternalLink size={16} />
                Open in a new tab
              </a>
              <button className="segment-button" onClick={() => commitNavigation('app://docs')}>
                Go to internal docs
              </button>
            </div>
          </div>
        </section>
      )}
    </section>
  )
}
