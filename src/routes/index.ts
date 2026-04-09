/**
 * ============================================================================
 * ARCHIVO: routes.ts
 * PROPÓSITO: Registro Centralizado de Rutas del Sistema NEXUS OS
 * ARQUITECTURA: Hexagonal - Capa de Aplicación / Dominio
 * ============================================================================
 * 
 * Este script define el mapa de navegación principal del sistema operativo.
 * En una arquitectura hexagonal, este archivo actúa como un adaptador de 
 * entrada, mapeando las solicitudes de navegación (rutas) a los casos de uso
 * correspondientes (Aplicaciones o Vistas).
 * 
 * FORMATO REQUERIDO:
 * - Públicas: "pub:[ruta]" (Ej: pub:/login)
 * - Privadas: "priv:[ruta]" (Ej: priv:/desktop)
 */

/**
 * Interfaz que define la estructura de una ruta en NEXUS OS.
 * @interface NexusRoute
 */
export interface NexusRoute {
  /** Identificador único de la ruta (pub: o priv:) */
  path: string
  /** Nombre amigable de la vista o aplicación */
  name: string
  /** Indica si la ruta requiere autenticación */
  isPrivate: boolean
  /** Componente o ID de la aplicación a cargar */
  target: string
}

/**
 * Diccionario de Rutas del Sistema
 * Aquí se definen todas las "miles de rutas" de forma modular y escalable.
 */
export const NEXUS_ROUTES: Record<string, NexusRoute> = {
  // --------------------------------------------------------------------------
  // RUTAS PÚBLICAS (No requieren autenticación)
  // --------------------------------------------------------------------------
  
  /** Ruta de arranque del sistema */
  'pub:/boot': {
    path: 'pub:/boot',
    name: 'Boot Screen',
    isPrivate: false,
    target: 'BootLoader',
  },
  
  /** Pantalla de inicio de sesión (Opcional para futuro) */
  'pub:/login': {
    path: 'pub:/login',
    name: 'User Login',
    isPrivate: false,
    target: 'AuthScreen',
  },

  // --------------------------------------------------------------------------
  // RUTAS PRIVADAS (Requieren sesión activa / sistema montado)
  // --------------------------------------------------------------------------
  
  /** Escritorio principal (Workspace) */
  'priv:/desktop': {
    path: 'priv:/desktop',
    name: 'Workspace Desktop',
    isPrivate: true,
    target: 'DesktopShell',
  },
  
  /** Gestor de Archivos */
  'priv:/apps/explorer': {
    path: 'priv:/apps/explorer',
    name: 'File Explorer',
    isPrivate: true,
    target: 'explorer',
  },
  
  /** Terminal / Consola del sistema */
  'priv:/apps/terminal': {
    path: 'priv:/apps/terminal',
    name: 'System Console',
    isPrivate: true,
    target: 'terminal',
  },
  
  /** Aplicación de Notas */
  'priv:/apps/notes': {
    path: 'priv:/apps/notes',
    name: 'Notes Editor',
    isPrivate: true,
    target: 'notes',
  },
  
  /** Navegador Web Interno */
  'priv:/apps/browser': {
    path: 'priv:/apps/browser',
    name: 'Web Browser',
    isPrivate: true,
    target: 'browser',
  },
  
  /** Configuración del Sistema */
  'priv:/apps/settings': {
    path: 'priv:/apps/settings',
    name: 'System Settings',
    isPrivate: true,
    target: 'settings',
  }
}

/**
 * Función auxiliar para obtener una ruta por su path.
 * @param path - El path de la ruta (ej: "priv:/desktop")
 * @returns La configuración de la ruta o undefined si no existe
 */
export function getRoute(path: string): NexusRoute | undefined {
  return NEXUS_ROUTES[path]
}

/**
 * Función auxiliar para validar si una ruta requiere autenticación.
 * Útil para los guards de navegación.
 * @param path - El path de la ruta a verificar
 * @returns boolean indicando si es privada
 */
export function isPrivateRoute(path: string): boolean {
  return path.startsWith('priv:')
}
