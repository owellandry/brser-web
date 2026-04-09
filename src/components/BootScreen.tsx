import { FaWindows } from 'react-icons/fa'

interface BootScreenProps {
  message: string
}

export function BootScreen({ message }: BootScreenProps) {
  return (
    <div className="win-boot-screen">
      <div className="win-boot-logo">
        <FaWindows size={100} color="#0078D7" />
      </div>
      <div className="win-boot-spinner">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
      <p className="win-boot-copy">{message}</p>
    </div>
  )
}
