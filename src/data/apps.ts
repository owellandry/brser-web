import {
  VscFolder,
  VscTerminal,
  VscEdit,
  VscSettingsGear,
  VscCompassActive,
  VscLayoutCentered
} from 'react-icons/vsc'
import { FaEdge } from 'react-icons/fa'
import type { AppDefinition, AppId, WindowPayload } from '../types'
import { basename } from '../utils/path'

export const defaultPreferences = {
  theme: 'aurora',
  wallpaper: 'orbital',
} as const

export const appRegistry: Record<AppId, AppDefinition> = {
  explorer: {
    id: 'explorer',
    name: 'File Explorer',
    description: 'Navigate the virtual filesystem and launch documents.',
    icon: VscFolder,
    allowMultiple: true,
    defaultSize: { width: 760, height: 520 },
    minSize: { width: 480, height: 320 },
    permissions: ['filesystem'],
    accent: '#facc15', // Yellow folder color
  },
  terminal: {
    id: 'terminal',
    name: 'Command Prompt',
    description: 'Command-driven access to the sandbox kernel and files.',
    icon: VscTerminal,
    allowMultiple: true,
    defaultSize: { width: 720, height: 460 },
    minSize: { width: 420, height: 320 },
    permissions: ['filesystem'],
    accent: '#1e1e1e', // Black/dark grey
  },
  notes: {
    id: 'notes',
    name: 'Notepad',
    description: 'A fast markdown-friendly editor with autosave.',
    icon: VscEdit,
    allowMultiple: true,
    defaultSize: { width: 700, height: 520 },
    minSize: { width: 420, height: 320 },
    permissions: ['filesystem'],
    accent: '#38bdf8', // Light blue
  },
  browser: {
    id: 'browser',
    name: 'Microsoft Edge',
    description: 'Internal docs and embeddable destinations.',
    icon: FaEdge,
    allowMultiple: true,
    defaultSize: { width: 760, height: 560 },
    minSize: { width: 460, height: 360 },
    permissions: ['embed'],
    accent: '#0ea5e9', // Edge blue
  },
  settings: {
    id: 'settings',
    name: 'Settings',
    description: 'Themes, wallpapers, install state and reset controls.',
    icon: VscSettingsGear,
    allowMultiple: false,
    defaultSize: { width: 680, height: 520 },
    minSize: { width: 440, height: 320 },
    permissions: ['settings'],
    accent: '#64748b', // Grey
  },
}

export const desktopAppIds: AppId[] = [
  'explorer',
  'terminal',
  'notes',
  'browser',
  'settings',
]

export const spotlightCards = [
  {
    title: 'Rust/WASM kernel',
    copy: 'Path resolution and command parsing stay inside the sandbox boundary.',
    icon: VscCompassActive,
  },
  {
    title: 'Local-first workspace',
    copy: 'Desktop layout, notes and files persist inside IndexedDB.',
    icon: VscLayoutCentered,
  },
]

export function deriveWindowTitle(appId: AppId, payload: WindowPayload) {
  switch (appId) {
    case 'explorer':
      return payload.currentPath && payload.currentPath !== '/'
        ? `File Explorer - ${basename(String(payload.currentPath))}`
        : 'File Explorer'
    case 'terminal':
      return payload.cwd ? `Command Prompt - ${String(payload.cwd)}` : 'Command Prompt'
    case 'notes':
      return payload.path ? `Notepad - ${basename(String(payload.path))}` : 'Notepad'
    case 'browser':
      return payload.location ? `Microsoft Edge - ${String(payload.location)}` : 'Microsoft Edge'
    case 'settings':
      return 'Settings'
    default:
      return 'Application'
  }
}
