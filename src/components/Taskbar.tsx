import { MonitorCog, Power, Rocket, Wifi } from 'lucide-react'
import { appRegistry } from '../data/apps'
import { useOSStore } from '../store/osStore'
import { useEffect, useState } from 'react'

function ClockChip() {
  const [now, setNow] = useState(() =>
    new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    }).format(new Date()),
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(
        new Intl.DateTimeFormat(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          month: 'short',
          day: 'numeric',
        }).format(new Date()),
      )
    }, 1000 * 30)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <span className="status-chip">
      <Wifi size={16} />
      {now}
    </span>
  )
}

export function Taskbar() {
  const windows = useOSStore((state) => state.windows)
  const launcherOpen = useOSStore((state) => state.launcherOpen)
  const toggleLauncher = useOSStore((state) => state.toggleLauncher)
  const focusWindow = useOSStore((state) => state.focusWindow)
  const minimizeWindow = useOSStore((state) => state.minimizeWindow)
  const pwaReady = useOSStore((state) => state.pwaReady)
  const openApp = useOSStore((state) => state.openApp)

  return (
    <footer className="taskbar">
      <button className="taskbar-brand" onClick={toggleLauncher}>
        <Rocket size={20} />
        <span>{launcherOpen ? 'Close launcher' : 'Open launcher'}</span>
      </button>

      <div className="taskbar-window-strip">
        {windows
          .slice()
          .sort((left, right) => left.zIndex - right.zIndex)
          .map((window) => {
            const app = appRegistry[window.appId]
            const Icon = app.icon
            return (
              <button
                key={window.id}
                className={`taskbar-window ${window.isFocused ? 'is-focused' : ''}`}
                onClick={() => {
                  if (window.status === 'minimized') {
                    focusWindow(window.id)
                    return
                  }

                  if (window.isFocused) {
                    minimizeWindow(window.id)
                    return
                  }

                  focusWindow(window.id)
                }}
              >
                <Icon size={16} />
                <span>{window.title}</span>
              </button>
            )
          })}
      </div>

      <div className="taskbar-side">
        <button className="status-chip" onClick={() => openApp('settings')}>
          <MonitorCog size={16} />
          {pwaReady ? 'Offline ready' : 'Shell live'}
        </button>
        <ClockChip />
        <button className="status-chip" onClick={() => openApp('settings')}>
          <Power size={16} />
          Preferences
        </button>
      </div>
    </footer>
  )
}
