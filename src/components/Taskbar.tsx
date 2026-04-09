/**
 * ============================================================================
 * ARCHIVO: Taskbar.tsx
 * PROPÓSITO: Barra de Tareas (Dock/Taskbar) del sistema NEXUS OS
 * ARQUITECTURA: Hexagonal - Capa UI (Presentación)
 * LÍMITE DE LÍNEAS: < 200
 * ============================================================================
 * Este componente representa la barra inferior del sistema operativo.
 * Es la responsable de gestionar la apertura de aplicaciones, su enfoque
 * y el acceso al panel principal (Launcher).
 */

import { MdWifi, MdNotifications, MdVolumeUp, MdSearch, MdApps } from 'react-icons/md'
import { appRegistry, desktopAppIds } from '../data/apps'
import { useOSStore } from '../store/osStore'
import { useEffect, useState } from 'react'

/**
 * COMPONENTE: ClockChip
 * PROPÓSITO: Renderiza y actualiza la hora del sistema en la bandeja de iconos
 * de manera autónoma sin renderizar toda la Taskbar.
 */
function ClockChip() {
  // Estado local para mantener la hora actual
  const [now, setNow] = useState(() =>
    new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date()),
  )

  // Efecto que actualiza el reloj cada 30 segundos
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

/**
 * COMPONENTE PRINCIPAL: Taskbar
 * PROPÓSITO: Contiene los accesos directos (Dock), botón del Launcher
 * y la bandeja del sistema (System Tray).
 */
export function Taskbar() {
  // --- CAPA DE APLICACIÓN (Conexión con el estado global) ---
  const windows = useOSStore((state) => state.windows)
  const launcherOpen = useOSStore((state) => state.launcherOpen)
  const toggleLauncher = useOSStore((state) => state.toggleLauncher)
  const focusWindow = useOSStore((state) => state.focusWindow)
  const minimizeWindow = useOSStore((state) => state.minimizeWindow)
  const openApp = useOSStore((state) => state.openApp)

  // Determinar cuál es la ventana actualmente enfocada
  const activeWindow = windows
    .filter((w) => w.status !== 'minimized')
    .sort((a, b) => a.zIndex - b.zIndex)
    .pop()

  // Generar la lista de aplicaciones del Dock (ancladas + abiertas)
  const dockApps = desktopAppIds.map((id) => ({
    id,
    app: appRegistry[id],
    isOpen: windows.some((w) => w.appId === id),
    isFocused: activeWindow?.appId === id,
  }))

  // Manejador de eventos para abrir/enfocar una app desde el Dock
  const handleAppClick = (id: string) => {
    const win = windows.find((w) => w.appId === id)
    if (win) {
      if (win.status === 'minimized') focusWindow(win.id)
      else if (win.isFocused) minimizeWindow(win.id)
      else focusWindow(win.id)
    } else {
      // Rutas o acciones por defecto al abrir una app (Ports)
      const payload =
        id === 'explorer' ? { currentPath: '/Home' }
        : id === 'terminal' ? { cwd: '/Home' }
        : id === 'notes' ? { path: '/Home/Notes/Field Notes.md' }
        : id === 'browser' ? { location: 'app://docs' }
        : {}
      openApp(id, payload)
    }
  }

  // --- CAPA DE PRESENTACIÓN (Renderizado UI) ---
  return (
    <div className="neo-taskbar-wrapper">
      <div className="neo-taskbar">
        
        {/* SECCIÓN IZQUIERDA: Botón del Launcher (Inicio) */}
        <div className="neo-taskbar-left">
          <button 
            className={`neo-launcher-btn ${launcherOpen ? 'is-open' : ''}`} 
            onClick={toggleLauncher}
            aria-label="Toggle Launcher"
          >
            <MdApps size={24} />
          </button>
        </div>

        {/* SECCIÓN CENTRAL: Strip de aplicaciones (Dock) */}
        <div className="neo-task-strip">
          {dockApps.map(({ id, app, isOpen, isFocused }) => {
            const Icon = app.icon
            return (
              <button
                key={id}
                className={`neo-task-item ${isOpen ? 'is-open' : ''} ${isFocused ? 'is-focused' : ''}`}
                onClick={() => handleAppClick(id)}
                aria-label={`Open ${app.name}`}
              >
                <div className="neo-task-icon" style={{ color: app.accent }}>
                  <Icon size={24} />
                </div>
              </button>
            )
          })}
        </div>

        {/* SECCIÓN DERECHA: Bandeja del Sistema (Tray) */}
        <div className="neo-taskbar-right">
          <button className="neo-tray-icon" aria-label="Search">
            <MdSearch size={20} />
          </button>
          <button className="neo-tray-icon" aria-label="Network">
            <MdWifi size={20} />
          </button>
          <button className="neo-tray-icon" aria-label="Volume">
            <MdVolumeUp size={20} />
          </button>
          <button className="neo-tray-icon" aria-label="Notifications">
            <MdNotifications size={20} />
          </button>
          <ClockChip />
        </div>
        
      </div>
    </div>
  )
}
