/**
 * ============================================================================
 * ARCHIVO: SettingsApp.tsx
 * PROPÓSITO: Panel de Configuración de NEXUS OS
 * ARQUITECTURA: Hexagonal - Capa de Aplicación (Caso de Uso) / UI
 * ============================================================================
 * Permite cambiar el tema, wallpaper y opciones de sistema como el reset.
 */

import { MdDownload, MdRestore } from 'react-icons/md'
import { useOSStore } from '../store/osStore'

const wallpaperCards = [
  {
    id: 'orbital',
    name: 'Nebula Core',
    swatch: 'linear-gradient(180deg, #101820 0%, #0a0e14 48%, #05080a 100%)',
  },
  {
    id: 'dunes',
    name: 'Cyber Dust',
    swatch: 'linear-gradient(180deg, #2a1f18 0%, #1e1511 48%, #140d0a 100%)',
  },
  {
    id: 'grid',
    name: 'Neon Grid',
    swatch: 'linear-gradient(180deg, #16202b 0%, #0e141a 48%, #080b0f 100%)',
  },
] as const

const themeCards = [
  { id: 'aurora', name: 'Cyan Protocol', copy: 'Blue system accent with a cleaner shell.' },
  { id: 'ember', name: 'Magenta Drive', copy: 'Violet system accent while keeping the structured UI.' },
] as const

/**
 * COMPONENTE: SettingsApp
 * Gestiona y aplica las preferencias del entorno
 */
export function SettingsApp() {
  const preferences = useOSStore((state) => state.preferences)
  const setPreference = useOSStore((state) => state.setPreference)
  const resetWorkspace = useOSStore((state) => state.resetWorkspace)
  const pwaReady = useOSStore((state) => state.pwaReady)

  return (
    <section className="app-surface" style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* SECCIÓN: Tema Visual */}
      <section className="app-panel" style={{ padding: 24 }}>
        <h2 className="settings-heading" style={{ fontSize: 18, marginBottom: 8 }}>Visual theme</h2>
        <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>Shape the shell without losing the data living underneath it.</p>
        <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {themeCards.map((theme) => (
            <button
              key={theme.id}
              className={`setting-choice ${preferences.theme === theme.id ? 'is-active' : ''}`}
              onClick={() => setPreference('theme', theme.id)}
            >
              <strong style={{ display: 'block', marginBottom: 4 }}>{theme.name}</strong>
              <p className="muted" style={{ fontSize: 12, margin: 0 }}>{theme.copy}</p>
            </button>
          ))}
        </div>
      </section>

      {/* SECCIÓN: Wallpaper */}
      <section className="app-panel" style={{ padding: 24 }}>
        <h2 className="settings-heading" style={{ fontSize: 18, marginBottom: 20 }}>Wallpaper mood</h2>
        <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {wallpaperCards.map((wallpaper) => (
            <button
              key={wallpaper.id}
              className={`setting-choice ${preferences.wallpaper === wallpaper.id ? 'is-active' : ''}`}
              onClick={() => setPreference('wallpaper', wallpaper.id)}
            >
              <span className="settings-swatch" style={{ background: wallpaper.swatch }} />
              <strong style={{ fontSize: 13 }}>{wallpaper.name}</strong>
            </button>
          ))}
        </div>
      </section>

      {/* SECCIÓN: Runtime & Storage */}
      <section className="app-panel" style={{ padding: 24 }}>
        <h2 className="settings-heading" style={{ fontSize: 18, marginBottom: 20 }}>Runtime & Storage</h2>
        <div className="app-toolbar" style={{ background: 'transparent', padding: 0, border: 'none' }}>
          <span className="status-chip">
            <MdDownload size={16} />
            {pwaReady ? 'Offline shell cached' : 'PWA active when built for production'}
          </span>
          <span className="toolbar-spacer" />
          <button className="pill-button" onClick={() => void resetWorkspace()}>
            <MdRestore size={16} />
            Reset workspace
          </button>
        </div>
      </section>
    </section>
  )
}
