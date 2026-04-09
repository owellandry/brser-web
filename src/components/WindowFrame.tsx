import { MdClose, MdRemove, MdCropSquare } from 'react-icons/md'
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
      className={`neo-window ${windowState.isFocused ? 'is-focused' : ''} ${singleWindowMode ? 'is-mobile' : ''}`}
    >
      <header className="neo-window-header" onDoubleClick={() => toggleMaximizeWindow(windowState.id)}>
        <div className="neo-window-title">
          <Icon size={16} color={app.accent} />
          <span>{windowState.title}</span>
        </div>
        <div className="neo-window-controls">
          <button
            className="neo-control"
            aria-label="Minimize window"
            onClick={(e) => { e.stopPropagation(); minimizeWindow(windowState.id); }}
          >
            <MdRemove size={16} />
          </button>
          <button
            className="neo-control"
            aria-label="Toggle window size"
            onClick={(e) => { e.stopPropagation(); toggleMaximizeWindow(windowState.id); }}
          >
            <MdCropSquare size={14} />
          </button>
          <button
            className="neo-control close"
            aria-label="Close window"
            onClick={(e) => { e.stopPropagation(); closeWindow(windowState.id); }}
          >
            <MdClose size={16} />
          </button>
        </div>
      </header>

      <div className="neo-window-content">{renderApp(windowState)}</div>
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
