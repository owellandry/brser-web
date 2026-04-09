/**
 * ============================================================================
 * ARCHIVO: DesktopShell.tsx
 * PROPÓSITO: Espacio de trabajo (Desktop) de NEXUS OS
 * ARQUITECTURA: Hexagonal - Capa UI (Contenedor de Dominio Principal)
 * LÍMITE DE LÍNEAS: < 200
 * ============================================================================
 * Integra la pantalla de arranque, iconos del escritorio, manejador de ventanas,
 * el Taskbar inferior y el Launcher Panel de aplicaciones.
 */

import { useEffect } from 'react'
import { appRegistry, desktopAppIds } from '../data/apps'
import { useOSStore } from '../store/osStore'
import { BootScreen } from './BootScreen'
import { LauncherPanel } from './LauncherPanel'
import { Taskbar } from './Taskbar'
import { WindowFrame } from './WindowFrame'

/**
 * COMPONENTE PRINCIPAL: DesktopShell
 * Maneja el ciclo de vida del SO (Arranque -> Escritorio Listo).
 */
export function DesktopShell() {
  // --- CAPA DE APLICACIÓN (Store y Estados) ---
  const bootState = useOSStore((state) => state.bootState)
  const bootMessage = useOSStore((state) => state.bootMessage)
  const hydrate = useOSStore((state) => state.hydrate)
  const windows = useOSStore((state) => state.windows)
  const openApp = useOSStore((state) => state.openApp)
  const preferences = useOSStore((state) => state.preferences)
  const launcherOpen = useOSStore((state) => state.launcherOpen)
  const setSingleWindowMode = useOSStore((state) => state.setSingleWindowMode)
  const singleWindowMode = useOSStore((state) => state.singleWindowMode)

  // --- EFECTOS (Adaptadores y Ciclo de vida) ---
  
  // 1. Inicializar e hidratar estado del SO al cargar
  useEffect(() => {
    void hydrate()
  }, [hydrate])

  // 2. Listener para modo responsive (pantallas pequeñas = modo app única)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 960px)')
    const handleChange = () => setSingleWindowMode(media.matches)
    handleChange() // Verificación inicial
    media.addEventListener('change', handleChange)

    return () => media.removeEventListener('change', handleChange)
  }, [setSingleWindowMode])

  // --- CONTROL DE FLUJO DE UI ---

  // Mostrar BootScreen si el sistema no ha terminado de cargar
  if (bootState !== 'ready') {
    return <BootScreen message={bootMessage} />
  }

  // Filtrar ventanas minimizadas y organizar por zIndex
  const visibleWindows = windows
    .filter((window) => window.status !== 'minimized')
    .sort((left, right) => left.zIndex - right.zIndex)
    
  const activeWindow = visibleWindows.at(-1)
  
  // En modo móvil, solo mostramos la ventana activa
  const renderedWindows = singleWindowMode && activeWindow ? [activeWindow] : visibleWindows

  // --- RENDERIZADO DEL ESCRITORIO ---
  return (
    <main 
      className="os-shell" 
      data-wallpaper={preferences.wallpaper}
      data-theme={preferences.theme}
      role="application"
    >
      <div className="desktop-area">
        {/* SECCIÓN: Atajos del Escritorio */}
        <section className="desktop-shortcuts" aria-label="Desktop apps">
          {desktopAppIds.map((appId) => {
            const app = appRegistry[appId]
            const Icon = app.icon
            
            // Rutas base por defecto para las apps principales
            const payload =
              appId === 'explorer' ? { currentPath: '/Home' }
              : appId === 'terminal' ? { cwd: '/Home' }
              : appId === 'notes' ? { path: '/Home/Notes/Field Notes.md' }
              : appId === 'browser' ? { location: 'app://docs' }
              : {}

            return (
              <button
                key={appId}
                className="desktop-shortcut"
                onDoubleClick={() => openApp(appId, payload)}
                onClick={() => openApp(appId, payload)}
                aria-label={`Open ${app.name}`}
              >
                <span className="desktop-shortcut-badge">
                  <Icon size={40} color={app.accent || '#fff'} />
                </span>
                <span className="desktop-shortcut-label">{app.name}</span>
              </button>
            )
          })}
        </section>

        {/* SECCIÓN: Gestor de Ventanas */}
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

      {/* COMPONENTES FLOTANTES */}
      {launcherOpen ? <LauncherPanel /> : null}
      <Taskbar />
    </main>
  )
}
