/**
 * ============================================================================
 * ARCHIVO: TerminalApp.tsx
 * PROPÓSITO: Emulador de Terminal / Consola de NEXUS OS
 * ARQUITECTURA: Hexagonal - Capa de Aplicación (Caso de Uso) / UI
 * ============================================================================
 * Permite ejecutar comandos interpretados por el kernel virtual (kernelBridge).
 */

import { useEffect, useRef, useState } from 'react'
import { MdChevronRight } from 'react-icons/md'
import { kernelBridge } from '../services/kernelBridge'
import { useOSStore } from '../store/osStore'

interface TerminalLine {
  id: string
  kind: 'output' | 'error' | 'system' | 'input'
  content: string
}

interface TerminalAppProps {
  windowId: string
}

/**
 * COMPONENTE: TerminalApp
 * Renderiza el prompt interactivo y el historial de comandos.
 */
export function TerminalApp({ windowId }: TerminalAppProps) {
  // --- ESTADO GLOBAL ---
  const windowState = useOSStore((state) => state.windows.find((window) => window.id === windowId))
  const updateWindowPayload = useOSStore((state) => state.updateWindowPayload)
  const openApp = useOSStore((state) => state.openApp)
  const markFsDirty = useOSStore((state) => state.markFsDirty)

  // --- ESTADO LOCAL ---
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: crypto.randomUUID(),
      kind: 'system',
      content: 'NEXUS OS kernel online. Type `help` to list available commands.',
    },
  ])
  
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const cwd = windowState && typeof windowState.payload.cwd === 'string' ? windowState.payload.cwd : '/Home'

  // --- EFECTOS ---
  
  // Auto-scroll al fondo cuando hay nuevas líneas
  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [lines])

  if (!windowState) return null

  // --- MÉTODOS DE DOMINIO ---

  /** Ejecuta el comando escrito en el Kernel */
  async function handleSubmit() {
    const command = input.trim()
    if (!command) return

    setHistory((prev) => [command, ...prev])
    setHistoryIndex(null)
    setLines((prev) => [
      ...prev,
      { id: crypto.randomUUID(), kind: 'input', content: `${cwd} $ ${command}` },
    ])
    setInput('')

    try {
      // Llamada al Kernel (Port/Adapter subyacente)
      const result = await kernelBridge.exec(command, cwd)
      
      if (result.clear) {
        setLines([])
      } else {
        setLines((prev) => [
          ...prev,
          ...result.lines.map((line) => ({
            id: crypto.randomUUID(),
            kind: line.kind,
            content: line.content,
          })),
        ])
      }

      if (result.cwd !== cwd) updateWindowPayload(windowId, { cwd: result.cwd })
      if (result.fsChanged) markFsDirty()
      if (result.openTarget) openApp(result.openTarget.appId, result.openTarget.payload)
      
    } catch (error: unknown) {
      setLines((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: 'error',
          content: error instanceof Error ? error.message : 'Command failed.',
        },
      ])
    }
  }

  // --- MANEJO DE TECLADO ---
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      void handleSubmit()
    }

    if (event.key === 'ArrowUp' && history.length > 0) {
      event.preventDefault()
      const nextIndex = historyIndex === null ? 0 : Math.min(historyIndex + 1, history.length - 1)
      setHistoryIndex(nextIndex)
      setInput(history[nextIndex] ?? '')
    }

    if (event.key === 'ArrowDown' && history.length > 0) {
      event.preventDefault()
      const nextIndex = historyIndex === null ? null : historyIndex <= 1 ? null : historyIndex - 1
      setHistoryIndex(nextIndex)
      setInput(nextIndex === null ? '' : history[nextIndex] ?? '')
    }
  }

  // --- RENDERIZADO ---
  return (
    <section className="app-surface">
      <div className="status-chip mono">cwd {cwd}</div>
      
      {/* Panel de Salida (Output) */}
      <div ref={scrollerRef} className="terminal-panel">
        {lines.map((line) => (
          <div key={line.id} className="terminal-line mono" data-kind={line.kind}>
            <span aria-hidden="true">{line.kind === 'input' ? '>' : line.kind === 'error' ? '!' : ':'}</span>
            <span>{line.content}</span>
          </div>
        ))}
      </div>

      {/* Fila de Entrada (Prompt) */}
      <label className="terminal-input-row mono">
        <span><MdChevronRight size={18} /></span>
        <input
          className="terminal-input mono"
          aria-label="Terminal command"
          placeholder="Try help, ls, cat /Home/Notes/Field Notes.md or open app://docs"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </label>
    </section>
  )
}
