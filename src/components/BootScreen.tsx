import { MdHexagon } from 'react-icons/md'

interface BootScreenProps {
  message: string
}

export function BootScreen({ message }: BootScreenProps) {
  return (
    <div className="neo-boot-screen">
      <div className="neo-boot-logo">
        <MdHexagon size={120} className="pulse-icon" />
      </div>
      <h1 className="neo-boot-title">NEXUS OS</h1>
      <div className="neo-boot-progress">
        <div className="neo-boot-bar"></div>
      </div>
      <p className="neo-boot-copy">{message}</p>
    </div>
  )
}
