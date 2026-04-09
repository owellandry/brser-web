import { Download, RotateCcw } from 'lucide-react'
import { useOSStore } from '../store/osStore'

const wallpaperCards = [
  {
    id: 'orbital',
    name: 'Orbital',
    swatch:
      'radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.8), transparent 36%), linear-gradient(160deg, #04131d, #0b2232 46%, #071118)',
  },
  {
    id: 'dunes',
    name: 'Dunes',
    swatch:
      'radial-gradient(circle at 16% 22%, rgba(251, 146, 60, 0.85), transparent 34%), linear-gradient(160deg, #1a0f08, #522d1d 48%, #111315)',
  },
  {
    id: 'grid',
    name: 'Grid',
    swatch:
      'radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.7), transparent 34%), linear-gradient(160deg, #041009, #0b2f25 48%, #06131d)',
  },
] as const

const themeCards = [
  { id: 'aurora', name: 'Aurora', copy: 'Cool blue highlights and glass surfaces.' },
  { id: 'ember', name: 'Ember', copy: 'Warm accent lighting and dusk-inspired contrast.' },
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
