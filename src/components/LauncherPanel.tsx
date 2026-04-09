import { MdPerson, MdFolder, MdSettings, MdPowerSettingsNew } from 'react-icons/md'
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
    <div className="neo-launcher-overlay" onClick={toggleLauncher}>
      <div className="neo-launcher-panel" onClick={(e) => e.stopPropagation()}>
        <div className="neo-launcher-header">
          <h2>NEXUS Apps</h2>
          <div className="neo-launcher-search">
            <input type="text" placeholder="Search system..." autoFocus />
          </div>
        </div>

        <div className="neo-launcher-grid">
          {desktopAppIds.map((appId) => {
            const app = appRegistry[appId]
            const Icon = app.icon
            return (
              <button
                key={app.id}
                className="neo-app-card"
                onClick={() => handleLaunch(app.id)}
              >
                <div className="neo-app-icon" style={{ background: `linear-gradient(135deg, ${app.accent}44, transparent)` }}>
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

        <div className="neo-launcher-footer">
          <div className="neo-user">
            <MdPerson size={20} />
            <span>Admin</span>
          </div>
          <div className="neo-sys-actions">
            <button onClick={() => handleLaunch('explorer')}><MdFolder size={20} /></button>
            <button onClick={() => handleLaunch('settings')}><MdSettings size={20} /></button>
            <button><MdPowerSettingsNew size={20} color="#ff0055" /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
