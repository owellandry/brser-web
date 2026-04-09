import { Minus, Square, X } from 'lucide-react'
import { Rnd } from 'react-rnd'
import { BrowserApp } from '../apps/BrowserApp'
import { FileExplorerApp } from '../apps/FileExplorerApp'
import { NotesApp } from '../apps/NotesApp'
import { SettingsApp } from '../apps/SettingsApp'
import { TerminalApp } from '../apps/TerminalApp'
import { appRegistry } from '../data/apps'
import { useOSStore } from '../store/osStore'
import type { WindowState } from '../types'

interface WindowFrameProps {
  windowState: WindowState
  singleWindowMode: boolean
}

function renderApp(windowState: WindowState) {
  switch (windowState.appId) {
    case 'explorer':
      return <FileExplorerApp windowId={windowState.id} />
    case 'terminal':
      return <TerminalApp windowId={windowState.id} />
    case 'notes':
      return <NotesApp windowId={windowState.id} />
    case 'browser':
      return <BrowserApp windowId={windowState.id} />
    case 'settings':
      return <SettingsApp />
    default:
      return null
  }
}

export function WindowFrame({ windowState, singleWindowMode }: WindowFrameProps) {
  const focusWindow = useOSStore((state) => state.focusWindow)
  const closeWindow = useOSStore((state) => state.closeWindow)
  const minimizeWindow = useOSStore((state) => state.minimizeWindow)
  const toggleMaximizeWindow = useOSStore((state) => state.toggleMaximizeWindow)
  const updateWindowBounds = useOSStore((state) => state.updateWindowBounds)
  const app = appRegistry[windowState.appId]
  const Icon = app.icon
  const isMaximized = windowState.status === 'maximized'

  const content = (
    <div
      className={`window-frame ${windowState.isFocused ? 'is-focused' : ''} ${singleWindowMode ? 'is-mobile' : ''}`}
    >
      <header className="window-header">
        <span className="window-app-badge">
          <Icon size={18} />
        </span>
        <div className="window-title-group">
          <p className="window-title">{windowState.title}</p>
          <p className="window-subtitle">{app.description}</p>
        </div>

        <div className="window-controls">
          <button
            className="window-control"
            aria-label="Minimize window"
            onClick={() => minimizeWindow(windowState.id)}
          >
            <Minus size={16} />
          </button>
          <button
            className="window-control"
            aria-label="Toggle window size"
            onClick={() => toggleMaximizeWindow(windowState.id)}
          >
            <Square size={16} />
          </button>
          <button
            className="window-control"
            aria-label="Close window"
            onClick={() => closeWindow(windowState.id)}
          >
            <X size={16} />
          </button>
        </div>
      </header>

      <div className="window-content">{renderApp(windowState)}</div>
    </div>
  )

  if (singleWindowMode) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: windowState.zIndex,
        }}
        onMouseDown={() => focusWindow(windowState.id)}
      >
        {content}
      </div>
    )
  }

  return (
    <Rnd
      bounds="parent"
      size={
        isMaximized
          ? { width: '100%', height: '100%' }
          : { width: windowState.bounds.width, height: windowState.bounds.height }
      }
      position={
        isMaximized
          ? { x: 0, y: 0 }
          : { x: windowState.bounds.x, y: windowState.bounds.y }
      }
      minWidth={app.minSize.width}
      minHeight={app.minSize.height}
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      onDragStart={() => focusWindow(windowState.id)}
      onResizeStart={() => focusWindow(windowState.id)}
      onMouseDown={() => focusWindow(windowState.id)}
      onDragStop={(_event, data) => {
        updateWindowBounds(windowState.id, {
          ...windowState.bounds,
          x: data.x,
          y: data.y,
        })
      }}
      onResizeStop={(_event, _direction, ref, _delta, position) => {
        updateWindowBounds(windowState.id, {
          x: position.x,
          y: position.y,
          width: Number.parseFloat(ref.style.width),
          height: Number.parseFloat(ref.style.height),
        })
      }}
      style={{ zIndex: windowState.zIndex }}
    >
      {content}
    </Rnd>
  )
}
