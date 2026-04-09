import { Download, RotateCcw } from 'lucide-react'
import { useOSStore } from '../store/osStore'

const wallpaperCards = [
  {
    id: 'orbital',
    name: 'Orbital',
    swatch:
      'linear-gradient(180deg, #e7f0fb, #dce8f4 48%, #d2dde8)',
  },
  {
    id: 'dunes',
    name: 'Dunes',
    swatch:
      'linear-gradient(180deg, #efe6dc, #e4d8cb 48%, #d8ccbf)',
  },
  {
    id: 'grid',
    name: 'Grid',
    swatch:
      'linear-gradient(180deg, #e4eef7, #d6e3ef 48%, #cad8e4)',
  },
] as const

const themeCards = [
  { id: 'aurora', name: 'Aurora', copy: 'Blue system accent with a cleaner Windows-like shell.' },
  { id: 'ember', name: 'Ember', copy: 'Warmer system accent while keeping the same structured UI.' },
] as const

export function SettingsApp() {
  const preferences = useOSStore((state) => state.preferences)
  const setPreference = useOSStore((state) => state.setPreference)
  const resetWorkspace = useOSStore((state) => state.resetWorkspace)
  const pwaReady = useOSStore((state) => state.pwaReady)

  return (
    <section className="app-surface">
      <section className="app-panel" style={{ padding: 18 }}>
        <h2 className="settings-heading">Visual theme</h2>
        <p className="muted">Shape the shell without losing the data living underneath it.</p>
        <div className="settings-grid" style={{ marginTop: 18 }}>
          {themeCards.map((theme) => (
            <button
              key={theme.id}
              className={`setting-choice ${preferences.theme === theme.id ? 'is-active' : ''}`}
              onClick={() => setPreference('theme', theme.id)}
            >
              <strong>{theme.name}</strong>
              <p className="muted">{theme.copy}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="app-panel" style={{ padding: 18 }}>
        <h2 className="settings-heading">Wallpaper mood</h2>
        <div className="settings-grid" style={{ marginTop: 18 }}>
          {wallpaperCards.map((wallpaper) => (
            <button
              key={wallpaper.id}
              className={`setting-choice ${preferences.wallpaper === wallpaper.id ? 'is-active' : ''}`}
              onClick={() => setPreference('wallpaper', wallpaper.id)}
            >
              <span className="settings-swatch" style={{ background: wallpaper.swatch }} />
              <strong>{wallpaper.name}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="app-panel" style={{ padding: 18 }}>
        <h2 className="settings-heading">Runtime</h2>
        <div className="app-toolbar" style={{ marginTop: 16 }}>
          <span className="status-chip">
            <Download size={16} />
            {pwaReady ? 'Offline shell cached' : 'PWA active when built for production'}
          </span>
          <button className="pill-button" onClick={() => void resetWorkspace()}>
            <RotateCcw size={16} />
            Reset workspace
          </button>
        </div>
      </section>
    </section>
  )
}
