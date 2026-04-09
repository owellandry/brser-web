import { Apple, Battery, Search, Wifi } from 'lucide-react'
import { appRegistry, desktopAppIds } from '../data/apps'
import { useOSStore } from '../store/osStore'
import { useEffect, useState } from 'react'

function ClockChip() {
  const [now, setNow] = useState(() =>
    new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date()),
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(
        new Intl.DateTimeFormat(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }).format(new Date()),
      )
    }, 1000 * 30)

    return () => window.clearInterval(interval)
  }, [])

  return <span className="menubar-clock">{now}</span>
}

export function Taskbar() {
  const windows = useOSStore((state) => state.windows)
  const launcherOpen = useOSStore((state) => state.launcherOpen)
  const toggleLauncher = useOSStore((state) => state.toggleLauncher)
  const focusWindow = useOSStore((state) => state.focusWindow)
  const minimizeWindow = useOSStore((state) => state.minimizeWindow)
  const openApp = useOSStore((state) => state.openApp)

  const activeWindow = windows
    .filter((w) => w.status !== 'minimized')
    .sort((a, b) => a.zIndex - b.zIndex)
    .pop()

  const activeAppName = activeWindow
    ? appRegistry[activeWindow.appId].name
    : 'Finder'

  // Dock items: pinned apps + open unpinned apps
  const dockApps = desktopAppIds.map((id) => ({
    id,
    app: appRegistry[id],
    isOpen: windows.some((w) => w.appId === id),
    isFocused: activeWindow?.appId === id,
  }))

  return (
    <>
      <header className="menubar">
        <div className="menubar-left">
          <button className="menubar-apple" onClick={toggleLauncher}>
            <Apple size={16} />
          </button>
          <span className="menubar-active-app">{activeAppName}</span>
          <span className="menubar-item hide-mobile">File</span>
          <span className="menubar-item hide-mobile">Edit</span>
          <span className="menubar-item hide-mobile">View</span>
          <span className="menubar-item hide-mobile">Go</span>
          <span className="menubar-item hide-mobile">Window</span>
          <span className="menubar-item hide-mobile">Help</span>
        </div>

        <div className="menubar-right">
          <button className="menubar-icon" onClick={() => toggleLauncher()}>
            <Search size={16} />
          </button>
          <span className="menubar-icon">
            <Wifi size={16} />
          </span>
          <span className="menubar-icon">
            <Battery size={16} />
          </span>
          <ClockChip />
        </div>
      </header>

      <footer className="dock-container">
        <div className="dock">
          {dockApps.map(({ id, app, isOpen, isFocused }) => {
            const Icon = app.icon
            return (
              <button
                key={id}
                className={`dock-item ${isOpen ? 'is-open' : ''} ${isFocused ? 'is-focused' : ''}`}
                onClick={() => {
                  const win = windows.find((w) => w.appId === id)
                  if (win) {
                    if (win.status === 'minimized') {
                      focusWindow(win.id)
                    } else if (win.isFocused) {
                      minimizeWindow(win.id)
                    } else {
                      focusWindow(win.id)
                    }
                  } else {
                    const payload =
                      id === 'explorer'
                        ? { currentPath: '/Home' }
                        : id === 'terminal'
                          ? { cwd: '/Home' }
                          : id === 'notes'
                            ? { path: '/Home/Notes/Field Notes.md' }
                            : id === 'browser'
                              ? { location: 'app://docs' }
                              : {}
                    openApp(id, payload)
                  }
                }}
              >
                <div className="dock-icon-wrapper" style={{ '--app-color': app.accent } as React.CSSProperties}>
                  <Icon size={28} color="#fff" />
                </div>
                {isOpen && <span className="dock-indicator" />}
                <span className="dock-tooltip">{app.name}</span>
              </button>
            )
          })}
        </div>
      </footer>
    </>
  )
}
