import { VscAccount, VscFolder, VscSettingsGear, VscPower } from 'react-icons/vsc'
import { appRegistry, desktopAppIds, spotlightCards } from '../data/apps'
import { useOSStore } from '../store/osStore'

export function LauncherPanel() {
  const openApp = useOSStore((state) => state.openApp)
  const toggleLauncher = useOSStore((state) => state.toggleLauncher)

  const handleLaunch = (appId: string) => {
    const payload =
      appId === 'explorer'
        ? { currentPath: '/Home' }
        : appId === 'terminal'
          ? { cwd: '/Home' }
          : appId === 'notes'
            ? { path: '/Home/Notes/Field Notes.md' }
            : appId === 'browser'
              ? { location: 'app://docs' }
              : {}
    openApp(appId, payload)
    toggleLauncher()
  }

  return (
    <aside className="win-start-menu">
      <div className="win-start-rail">
        <button className="win-rail-item">
          <VscAccount size={20} />
          <span className="win-rail-tooltip">User</span>
        </button>
        <button className="win-rail-item" onClick={() => handleLaunch('explorer')}>
          <VscFolder size={20} />
          <span className="win-rail-tooltip">Documents</span>
        </button>
        <button className="win-rail-item" onClick={() => handleLaunch('settings')}>
          <VscSettingsGear size={20} />
          <span className="win-rail-tooltip">Settings</span>
        </button>
        <button className="win-rail-item">
          <VscPower size={20} />
          <span className="win-rail-tooltip">Power</span>
        </button>
      </div>

      <div className="win-start-apps">
        <div className="win-start-section">
          <h3>Pinned</h3>
          <div className="win-start-grid">
            {desktopAppIds.map((appId) => {
              const app = appRegistry[appId]
              const Icon = app.icon
              return (
                <button
                  key={app.id}
                  className="win-start-app-btn"
                  onClick={() => handleLaunch(app.id)}
                >
                  <div className="win-start-app-icon">
                    <Icon size={28} color={app.accent} />
                  </div>
                  <span>{app.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="win-start-section">
          <h3>Features</h3>
          <div className="win-start-tiles">
            {spotlightCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className="win-tile">
                  <div className="win-tile-content">
                    <Icon size={24} color="white" />
                    <p>{card.title}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}
