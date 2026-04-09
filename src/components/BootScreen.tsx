interface BootScreenProps {
  message: string
}

export function BootScreen({ message }: BootScreenProps) {
  return (
    <div className="boot-screen">
      <section className="boot-card">
        <p className="boot-kicker">Brser Virtual OS</p>
        <h1 className="boot-title">Mounting local desktop</h1>
        <p className="boot-copy">{message}</p>
        <div className="boot-progress" aria-hidden="true">
          <span />
        </div>
      </section>
    </div>
  )
}
