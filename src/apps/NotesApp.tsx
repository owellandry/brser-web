import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Save } from 'lucide-react'
import { readTextFile, writeTextFile } from '../services/fs'
import { useOSStore } from '../store/osStore'

interface NotesAppProps {
  windowId: string
}

export function NotesApp({ windowId }: NotesAppProps) {
  const windowState = useOSStore((state) => state.windows.find((window) => window.id === windowId))
  const updateWindowPayload = useOSStore((state) => state.updateWindowPayload)
  const markFsDirty = useOSStore((state) => state.markFsDirty)
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('Loading…')
  const isReadyRef = useRef(false)

  const path =
    windowState && typeof windowState.payload.path === 'string'
      ? windowState.payload.path
      : '/Home/Notes/Field Notes.md'

  useEffect(() => {
    let active = true
    isReadyRef.current = false
    updateWindowPayload(windowId, { path })

    void readTextFile(path)
      .then((nextContent) => {
        if (!active) {
          return
        }
        setContent(nextContent)
        setStatus('All changes saved')
        isReadyRef.current = true
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }
        setStatus(error instanceof Error ? error.message : 'Could not load note.')
      })

    return () => {
      active = false
    }
  }, [path, updateWindowPayload, windowId])

  const persistContent = useEffectEvent(async (nextContent: string) => {
    await writeTextFile(path, nextContent)
    markFsDirty()
    setStatus('All changes saved')
  })

  useEffect(() => {
    if (!isReadyRef.current) {
      return
    }

    const timer = window.setTimeout(() => {
      void persistContent(content)
    }, 320)

    return () => window.clearTimeout(timer)
  }, [content])

  if (!windowState) {
    return null
  }

  return (
    <section className="app-surface">
      <div className="app-toolbar">
        <span className="status-chip mono">{path}</span>
        <span className="toolbar-spacer" />
        <span className="status-chip">
          <Save size={16} />
          {status}
        </span>
      </div>

      <textarea
        className="notes-editor mono"
        value={content}
        onChange={(event) => {
          setContent(event.target.value)
          setStatus('Saving…')
        }}
        placeholder="Write something worth reopening tomorrow."
      />
    </section>
  )
}
