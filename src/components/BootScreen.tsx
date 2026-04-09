/**
 * ============================================================================
 * ARCHIVO: BootScreen.tsx
 * PROPÓSITO: Pantalla de carga (Boot Screen) de NEXUS OS
 * ARQUITECTURA: Hexagonal - Capa UI (Presentación)
 * LÍMITE DE LÍNEAS: < 200
 * ============================================================================
 * Componente que simula la carga del sistema operativo al iniciar.
 */

import { MdHexagon } from 'react-icons/md'

interface BootScreenProps {
  /** Mensaje de estado de carga actual */
  message: string
}

/**
 * COMPONENTE: BootScreen
 * Renderiza el logo del sistema, la barra de progreso y el estado actual.
 */
export function BootScreen({ message }: BootScreenProps) {
  return (
    <div className="neo-boot-screen" role="alert" aria-busy="true">
      <div className="neo-boot-logo">
        <MdHexagon size={120} className="pulse-icon" />
      </div>
      <h1 className="neo-boot-title">Zenit</h1>
      <div className="neo-boot-progress">
        <div className="neo-boot-bar" />
      </div>
      <p className="neo-boot-copy">{message}</p>
    </div>
  )
}
