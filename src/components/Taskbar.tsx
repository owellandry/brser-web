import { VscBell, VscChevronUp } from 'react-icons/vsc'
import { FaWindows, FaWifi } from 'react-icons/fa'
import { MdVolumeUp, MdSearch } from 'react-icons/md'
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

  const [date, setDate] = useState(() =>
    new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
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
      setDate(
        new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        }).format(d),
      )
    }, 1000 * 30)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="taskbar-clock">
      <span>{now}</span>
      <span>{date}</span>
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

  // Dock items: pinned apps + open unpinned apps
  const dockApps = desktopAppIds.map((id) => ({
    id,
    app: appRegistry[id],
    isOpen: windows.some((w) => w.appId === id),
    isFocused: activeWindow?.appId === id,
  }))

  return (
    <footer className="win-taskbar">
      <div className="win-taskbar-left">
        <button 
          className={`win-start-button ${launcherOpen ? 'is-open' : ''}`} 
          onClick={toggleLauncher}
        >
          <FaWindows size={18} color={launcherOpen ? "#0078D7" : "white"} />
        </button>
        <div className="win-search-box" onClick={toggleLauncher}>
          <MdSearch size={20} color="#888" />
          <span>Type here to search</span>
        </div>

        <div className="win-task-strip">
          {dockApps.map(({ id, app, isOpen, isFocused }) => {
            const Icon = app.icon
            return (
              <button
                key={id}
                className={`win-task-item ${isOpen ? 'is-open' : ''} ${isFocused ? 'is-focused' : ''}`}
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
                <Icon size={22} color={app.accent} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="win-taskbar-right">
        <button className="win-tray-icon">
          <VscChevronUp size={16} />
        </button>
        <button className="win-tray-icon">
          <FaWifi size={14} />
        </button>
        <button className="win-tray-icon">
          <MdVolumeUp size={18} />
        </button>
        <button className="win-tray-clock">
          <ClockChip />
        </button>
        <button className="win-tray-icon">
          <VscBell size={16} />
        </button>
        <div className="win-desktop-show" onClick={() => {
          windows.forEach(w => minimizeWindow(w.id))
        }} />
      </div>
    </footer>
  )
}
