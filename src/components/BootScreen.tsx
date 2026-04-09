import { Apple } from 'lucide-react'

interface BootScreenProps {
  message: string
}

export function BootScreen({ message }: BootScreenProps) {
  return (
    <div className="boot-screen">
      <section className="boot-card">
        <Apple size={80} color="white" />
        <div className="boot-progress" aria-hidden="true">
          <span />
        </div>
        <p className="boot-copy">{message}</p>
      </section>
    </div>
  )
}
