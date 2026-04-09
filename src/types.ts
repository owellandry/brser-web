import type { LucideIcon } from 'lucide-react'

export type AppId = 'explorer' | 'terminal' | 'notes' | 'settings' | 'browser'

export type AppPermission = 'filesystem' | 'settings' | 'embed'

export type WindowStatus = 'normal' | 'minimized' | 'maximized'

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export interface WindowPayload {
  [key: string]: string | number | boolean | null | undefined
}

export interface WindowState {
  id: string
  appId: AppId
  title: string
  bounds: Bounds
  status: WindowStatus
  zIndex: number
  isFocused: boolean
  payload: WindowPayload
  createdAt: number
}

export interface AppDefinition {
  id: AppId
  name: string
  description: string
  icon: LucideIcon
  allowMultiple: boolean
  defaultSize: Pick<Bounds, 'width' | 'height'>
  minSize: Pick<Bounds, 'width' | 'height'>
  permissions: AppPermission[]
  accent: string
}

export interface Preferences {
  theme: 'aurora' | 'ember'
  wallpaper: 'orbital' | 'dunes' | 'grid'
}

export interface FileNode {
  path: string
  name: string
  parentPath: string | null
  kind: 'file' | 'directory'
  content: string
  createdAt: number
  updatedAt: number
  mime: string
}

export interface SessionSnapshot {
  windows: WindowState[]
  preferences: Preferences
}

export interface KeyValueEntry<T = unknown> {
  key: string
  value: T
}

export interface ParsedKernelCommand {
  command: string
  args: string[]
  operation:
    | 'help'
    | 'ls'
    | 'cd'
    | 'pwd'
    | 'cat'
    | 'mkdir'
    | 'touch'
    | 'echo'
    | 'clear'
    | 'open'
    | 'unknown'
  target?: string | null
  text?: string | null
  redirect?: string | null
}

export interface CommandExecutionResult {
  cwd: string
  lines: Array<{ kind: 'output' | 'error' | 'system'; content: string }>
  clear?: boolean
  fsChanged?: boolean
  openTarget?: {
    appId: AppId
    payload: WindowPayload
  }
}
