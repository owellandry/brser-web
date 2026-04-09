/**
 * ============================================================================
 * ARCHIVO: LauncherPanel.tsx
 * PROPÓSITO: Panel de Lanzamiento (Start Menu) de NEXUS OS
 * ARQUITECTURA: Hexagonal - Capa UI (Presentación)
 * LÍMITE DE LÍNEAS: < 200
 * ============================================================================
 * Overlay interactivo para iniciar aplicaciones y buscar en el sistema.
 */

import { MdPerson, MdFolder, MdSettings, MdPowerSettingsNew } from 'react-icons/md'
import { appRegistry, desktopAppIds } from '../data/apps'
import { useOSStore } from '../store/osStore'
import type { AppId } from '../types'

/**
 * COMPONENTE: LauncherPanel
 * Representa el menú de inicio flotante de cristal.
 */
export function LauncherPanel() {
  // --- CAPA DE APLICACIÓN ---
  const openApp = useOSStore((state) => state.openApp)
  const toggleLauncher = useOSStore((state) => state.toggleLauncher)

  /**
   * Manejador de lanzamiento: Envía la petición a la capa de Dominio/Store
   * @param appId Identificador de la aplicación a abrir
   */
  const handleLaunch = (appId: AppId) => {
    // Definimos el payload de arranque por defecto para cada app (Ports)
    const payload =
      appId === 'explorer' ? { currentPath: '/Home' }
      : appId === 'terminal' ? { cwd: '/Home' }
      : appId === 'notes' ? { path: '/Home/Notes/Field Notes.md' }
      : appId === 'browser' ? { location: 'app://docs' }
      : {}
      
    openApp(appId, payload)
    toggleLauncher() // Cerramos el launcher al abrir una app
  }

  // --- CAPA DE PRESENTACIÓN ---
  return (
    // Overlay oscuro para el efecto modal
    <div className="neo-launcher-overlay" onClick={toggleLauncher} aria-modal="true" role="dialog">
      {/* Prevenir que clics dentro del panel lo cierren */}
      <div className="neo-launcher-panel" onClick={(e) => e.stopPropagation()}>
        
        {/* Cabecera con título y buscador */}
        <div className="neo-launcher-header">
          <h2>Zenit Apps</h2>
          <div className="neo-launcher-search">
            <input type="text" placeholder="Search system..." autoFocus aria-label="Search apps" />
          </div>
        </div>

        {/* Grilla de aplicaciones ancladas */}
        <div className="neo-launcher-grid" role="menu">
          {desktopAppIds.map((appId) => {
            const app = appRegistry[appId]
            const Icon = app.icon
            return (
              <button
                key={app.id}
                className="neo-app-card"
                onClick={() => handleLaunch(app.id)}
                role="menuitem"
                aria-label={`Launch ${app.name}`}
              >
                <div 
                  className="neo-app-icon" 
                  style={{ background: `linear-gradient(135deg, ${app.accent}44, transparent)` }}
                >
                  <Icon size={32} color={app.accent} />
                </div>
                <div className="neo-app-info">
                  <strong>{app.name}</strong>
                  <span>{app.description}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Pie de página con usuario y accesos rápidos de energía/config */}
        <div className="neo-launcher-footer">
          <div className="neo-user">
            <MdPerson size={20} />
            <span>Admin</span>
          </div>
          <div className="neo-sys-actions">
            <button onClick={() => handleLaunch('explorer')} aria-label="Open Explorer"><MdFolder size={20} /></button>
            <button onClick={() => handleLaunch('settings')} aria-label="Open Settings"><MdSettings size={20} /></button>
            <button aria-label="Power off"><MdPowerSettingsNew size={20} color="#ff0055" /></button>
          </div>
        </div>
        
      </div>
    </div>
  )
}
