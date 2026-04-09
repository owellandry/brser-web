import { MdWifi, MdNotifications, MdVolumeUp, MdSearch, MdApps } from 'react-icons/md'
import { appRegistry, desktopAppIds } from '../data/apps'
import { useOSStore } from '../store/osStore'
import { useEffect, useState } from 'react'

function ClockChip() {
  const [now, setNow] = useState(() =>
    new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date()),
  )

  useEffect(() => {
    const interval = window.setInterval(() => {
      const d = new Date()
      setNow(
        new Intl.DateTimeFormat(undefined, {
          hour: 'numeric',
          minute: '2-digit',
        }).format(d),
      )
    }, 1000 * 30)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="neo-clock">
      <span>{now}</span>
    </div>
  )
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

  const dockApps = desktopAppIds.map((id) => ({
    id,
    app: appRegistry[id],
    isOpen: windows.some((w) => w.appId === id),
    isFocused: activeWindow?.appId === id,
  }))

  return (
    <div className="neo-taskbar-wrapper">
      <div className="neo-taskbar">
        <div className="neo-taskbar-left">
          <button 
            className={`neo-launcher-btn ${launcherOpen ? 'is-open' : ''}`} 
            onClick={toggleLauncher}
          >
            <MdApps size={24} />
          </button>
        </div>

        <div className="neo-task-strip">
          {dockApps.map(({ id, app, isOpen, isFocused }) => {
            const Icon = app.icon
            return (
              <button
                key={id}
                className={`neo-task-item ${isOpen ? 'is-open' : ''} ${isFocused ? 'is-focused' : ''}`}
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
                <div className="neo-task-icon" style={{ color: app.accent }}>
                  <Icon size={24} />
                </div>
              </button>
            )
          })}
        </div>

        <div className="neo-taskbar-right">
          <button className="neo-tray-icon">
            <MdSearch size={20} />
          </button>
          <button className="neo-tray-icon">
            <MdWifi size={20} />
          </button>
          <button className="neo-tray-icon">
            <MdVolumeUp size={20} />
          </button>
          <button className="neo-tray-icon">
            <MdNotifications size={20} />
          </button>
          <ClockChip />
        </div>
      </div>
    </div>
  )
}
