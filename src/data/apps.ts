/**
 * ============================================================================
 * ARCHIVO: apps.ts
 * PROPÓSITO: Registro Central de Aplicaciones y Preferencias Base
 * ARQUITECTURA: Hexagonal - Capa de Dominio (Entidades y Configuraciones)
 * ============================================================================
 * Define el listado oficial de aplicaciones disponibles en NEXUS OS,
 * sus metadatos (iconos, permisos, colores) y opciones por defecto.
 */

import {
  MdFolder,
  MdEditDocument,
  MdSettings,
  MdDashboard,
  MdWidgets
} from 'react-icons/md'
import { FaTerminal, FaGlobe } from 'react-icons/fa'
import type { AppDefinition, AppId, WindowPayload } from '../types'
import { basename } from '../utils/path'

/**
 * Configuraciones visuales por defecto del sistema
 */
export const defaultPreferences = {
  theme: 'aurora',
  wallpaper: 'orbital',
} as const

/**
 * REGISTRO DE APLICACIONES (App Registry)
 * Actúa como la fuente de verdad de todas las apps instaladas.
 */
export const appRegistry: Record<AppId, AppDefinition> = {
  explorer: {
    id: 'explorer',
    name: 'Files',
    description: 'Navigate the virtual filesystem and launch documents.',
    icon: MdFolder,
    allowMultiple: true,
    defaultSize: { width: 760, height: 520 },
    minSize: { width: 480, height: 320 },
    permissions: ['filesystem'],
    accent: '#f2c94c',
  },
  terminal: {
    id: 'terminal',
    name: 'Console',
    description: 'Command-driven access to the sandbox kernel and files.',
    icon: FaTerminal,
    allowMultiple: true,
    defaultSize: { width: 720, height: 460 },
    minSize: { width: 420, height: 320 },
    permissions: ['filesystem'],
    accent: '#4aa3df',
  },
  notes: {
    id: 'notes',
    name: 'Notes',
    description: 'A fast markdown-friendly editor with autosave.',
    icon: MdEditDocument,
    allowMultiple: true,
    defaultSize: { width: 700, height: 520 },
    minSize: { width: 420, height: 320 },
    permissions: ['filesystem'],
    accent: '#3d8bd6',
  },
  browser: {
    id: 'browser',
    name: 'Web',
    description: 'Internal docs and embeddable destinations.',
    icon: FaGlobe,
    allowMultiple: true,
    defaultSize: { width: 760, height: 560 },
    minSize: { width: 460, height: 360 },
    permissions: ['embed'],
    accent: '#0078d4',
  },
  settings: {
    id: 'settings',
    name: 'Settings',
    description: 'Themes, wallpapers, install state and reset controls.',
    icon: MdSettings,
    allowMultiple: false,
    defaultSize: { width: 680, height: 520 },
    minSize: { width: 440, height: 320 },
    permissions: ['settings'],
    accent: '#9aa4b2',
  },
}

/** 
 * IDs de las aplicaciones que se muestran en el escritorio por defecto 
 */
export const desktopAppIds: AppId[] = [
  'explorer',
  'terminal',
  'notes',
  'browser',
  'settings',
]

/**
 * Tarjetas de información ("Features" o "Spotlight") del Launcher
 */
export const spotlightCards = [
  {
    title: 'Core Kernel',
    copy: 'Local isolation with web assembly.',
    icon: MdDashboard,
  },
  {
    title: 'Persistent State',
    copy: 'Your layout and files are saved.',
    icon: MdWidgets,
  },
]

/**
 * Helper para derivar el título dinámico de la ventana
 * @param appId ID de la aplicación
 * @param payload Parámetros de la ventana activa
 * @returns String con el título formateado
 */
export function deriveWindowTitle(appId: AppId, payload: WindowPayload) {
  switch (appId) {
    case 'explorer':
      return payload.currentPath && payload.currentPath !== '/'
        ? `Files - ${basename(String(payload.currentPath))}`
        : 'Files'
    case 'terminal':
      return payload.cwd ? `Console - ${String(payload.cwd)}` : 'Console'
    case 'notes':
      return payload.path ? `Notes - ${basename(String(payload.path))}` : 'Notes'
    case 'browser':
      return payload.location ? `Web - ${String(payload.location)}` : 'Web'
    case 'settings':
      return 'Settings'
    default:
      return 'Application'
  }
}
