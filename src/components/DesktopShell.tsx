import { useEffect } from 'react'
import { appRegistry, desktopAppIds } from '../data/apps'
import { useOSStore } from '../store/osStore'
import { BootScreen } from './BootScreen'
import { LauncherPanel } from './LauncherPanel'
import { Taskbar } from './Taskbar'
import { WindowFrame } from './WindowFrame'

export function DesktopShell() {
  const bootState = useOSStore((state) => state.bootState)
  const bootMessage = useOSStore((state) => state.bootMessage)
  const hydrate = useOSStore((state) => state.hydrate)
  const windows = useOSStore((state) => state.windows)
  const openApp = useOSStore((state) => state.openApp)
  const preferences = useOSStore((state) => state.preferences)
  const launcherOpen = useOSStore((state) => state.launcherOpen)
  const setSingleWindowMode = useOSStore((state) => state.setSingleWindowMode)
  const singleWindowMode = useOSStore((state) => state.singleWindowMode)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 960px)')
    const handleChange = () => setSingleWindowMode(media.matches)
    handleChange()
    media.addEventListener('change', handleChange)

    return () => media.removeEventListener('change', handleChange)
  }, [setSingleWindowMode])

  if (bootState !== 'ready') {
    return <BootScreen message={bootMessage} />
  }

  const visibleWindows = windows
    .filter((window) => window.status !== 'minimized')
    .sort((left, right) => left.zIndex - right.zIndex)
  const activeWindow = visibleWindows.at(-1)
  const renderedWindows = singleWindowMode && activeWindow ? [activeWindow] : visibleWindows

  return (
    <main className="os-shell" data-wallpaper={preferences.wallpaper}>
      <div className="desktop-area">
        <section className="desktop-shortcuts" aria-label="Desktop apps">
          {desktopAppIds.map((appId) => {
            const app = appRegistry[appId]
            const Icon = app.icon
            const payload =
              appId === 'explorer'
                ? { currentPath: '/Home' }
                : appId === 'terminal'
                  ? { cwd: '/Home' }
                  : appId === 'notes'
                    ? { path: '/Home/Notes/Field Notes.md' }
                    : appId === 'browser'
                      ? { location: 'app://docs' }
                      : {}

            return (
              <button
                key={appId}
                className="desktop-shortcut"
                onDoubleClick={() => openApp(appId, payload)}
                onClick={() => openApp(appId, payload)}
              >
                <span className="desktop-shortcut-badge">
                  <Icon size={24} />
                </span>
                <span className="desktop-shortcut-label">{app.name}</span>
              </button>
            )
          })}
        </section>

        <section className="window-stage">
          {renderedWindows.map((window) => (
            <WindowFrame
              key={window.id}
              windowState={window}
              singleWindowMode={singleWindowMode}
            />
          ))}
        </section>
      </div>

      {launcherOpen ? <LauncherPanel /> : null}
      <Taskbar />
    </main>
  )
}
