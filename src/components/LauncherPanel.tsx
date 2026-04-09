import { ArrowRight } from 'lucide-react'
import { appRegistry, desktopAppIds, spotlightCards } from '../data/apps'
import { useOSStore } from '../store/osStore'

export function LauncherPanel() {
  const openApp = useOSStore((state) => state.openApp)

  return (
    <aside className="launcher-panel">
      <header className="launcher-header">
        <p className="boot-kicker">Launchpad</p>
        <h2>Everything you need is local</h2>
      </header>

      <div className="launcher-grid">
        {desktopAppIds.map((appId) => {
          const app = appRegistry[appId]
          const Icon = app.icon
          return (
            <button
              key={app.id}
              className="launcher-app"
              onClick={() => {
                const payload =
                  app.id === 'explorer'
                    ? { currentPath: '/Home' }
                    : app.id === 'terminal'
                      ? { cwd: '/Home' }
                      : app.id === 'notes'
                        ? { path: '/Home/Notes/Field Notes.md' }
                        : app.id === 'browser'
                          ? { location: 'app://docs' }
                          : {}
                openApp(app.id, payload)
              }}
            >
              <span className="launcher-app-badge">
                <Icon size={20} />
              </span>
              <span className="launcher-app-copy">
                <strong>{app.name}</strong>
                <span>{app.description}</span>
              </span>
              <ArrowRight size={18} />
            </button>
          )
        })}
      </div>

      <div className="settings-grid">
        {spotlightCards.map((card) => {
          const Icon = card.icon
          return (
            <section key={card.title} className="setting-choice">
              <Icon size={18} />
              <p className="window-title">{card.title}</p>
              <p className="muted">{card.copy}</p>
            </section>
          )
        })}
      </div>
    </aside>
  )
}
