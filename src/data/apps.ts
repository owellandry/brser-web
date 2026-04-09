import {
  Binary,
  Compass,
  FileStack,
  Globe,
  NotebookPen,
  PanelsTopLeft,
  Settings2,
} from 'lucide-react'
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
    icon: FileStack,
    allowMultiple: true,
    defaultSize: { width: 760, height: 520 },
    minSize: { width: 480, height: 320 },
    permissions: ['filesystem'],
    accent: '#7dd3fc',
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    description: 'Command-driven access to the sandbox kernel and files.',
    icon: Binary,
    allowMultiple: true,
    defaultSize: { width: 720, height: 460 },
    minSize: { width: 420, height: 320 },
    permissions: ['filesystem'],
    accent: '#4ade80',
  },
  notes: {
    id: 'notes',
    name: 'Notes',
    description: 'A fast markdown-friendly editor with autosave.',
    icon: NotebookPen,
    allowMultiple: true,
    defaultSize: { width: 700, height: 520 },
    minSize: { width: 420, height: 320 },
    permissions: ['filesystem'],
    accent: '#fb923c',
  },
  browser: {
    id: 'browser',
    name: 'Navigator',
    description: 'Internal docs and embeddable destinations.',
    icon: Globe,
    allowMultiple: true,
    defaultSize: { width: 760, height: 560 },
    minSize: { width: 460, height: 360 },
    permissions: ['embed'],
    accent: '#f472b6',
  },
  settings: {
    id: 'settings',
    name: 'Settings',
    description: 'Themes, wallpapers, install state and reset controls.',
    icon: Settings2,
    allowMultiple: false,
    defaultSize: { width: 680, height: 520 },
    minSize: { width: 440, height: 320 },
    permissions: ['settings'],
    accent: '#c084fc',
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
    icon: Compass,
  },
  {
    title: 'Local-first workspace',
    copy: 'Desktop layout, notes and files persist inside IndexedDB.',
    icon: PanelsTopLeft,
  },
]

export function deriveWindowTitle(appId: AppId, payload: WindowPayload) {
  switch (appId) {
    case 'explorer':
      return payload.currentPath && payload.currentPath !== '/'
        ? `Explorer - ${basename(String(payload.currentPath))}`
        : 'File Explorer'
    case 'terminal':
      return payload.cwd ? `Terminal - ${String(payload.cwd)}` : 'Terminal'
    case 'notes':
      return payload.path ? `Notes - ${basename(String(payload.path))}` : 'Notes'
    case 'browser':
      return payload.location ? `Navigator - ${String(payload.location)}` : 'Navigator'
    case 'settings':
      return 'Settings'
    default:
      return 'Application'
  }
}
