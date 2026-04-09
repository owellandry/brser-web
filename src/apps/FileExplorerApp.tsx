import { startTransition, useEffect, useState } from 'react'
import { File, FolderClosed, FolderPlus, Home, Plus, RefreshCcw } from 'lucide-react'
import type { FileNode } from '../types'
import { duplicateIntoDirectory, listDirectory, mkdir, writeTextFile } from '../services/fs'
import { resolveOpenTarget } from '../services/openTarget'
import { useOSStore } from '../store/osStore'
import { basename, parentPath } from '../utils/path'

interface FileExplorerAppProps {
  windowId: string
}

export function FileExplorerApp({ windowId }: FileExplorerAppProps) {
  const windowState = useOSStore((state) => state.windows.find((window) => window.id === windowId))
  const updateWindowPayload = useOSStore((state) => state.updateWindowPayload)
  const openApp = useOSStore((state) => state.openApp)
  const fsRevision = useOSStore((state) => state.fsRevision)
  const markFsDirty = useOSStore((state) => state.markFsDirty)

  const currentPath =
    windowState && typeof windowState.payload.currentPath === 'string'
      ? windowState.payload.currentPath
      : '/Home'

  const [entries, setEntries] = useState<FileNode[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true

    void listDirectory(currentPath)
      .then((items) => {
        if (!alive) {
          return
        }
        setEntries(items)
        setError(null)
      })
      .catch((loadError: unknown) => {
        if (!alive) {
          return
        }
        setError(loadError instanceof Error ? loadError.message : 'Could not list directory.')
      })

    return () => {
      alive = false
    }
  }, [currentPath, fsRevision])

  if (!windowState) {
    return null
  }

  async function openTarget(path: string) {
    const openInstruction = await resolveOpenTarget(path)
    openApp(openInstruction.appId, openInstruction.payload)
  }

  return (
    <section className="app-surface">
      <div className="app-toolbar">
        <button
          className="ghost-button"
          onClick={() => updateWindowPayload(windowId, { currentPath: '/Home' })}
        >
          <Home size={16} />
          Home
        </button>
        <button
          className="ghost-button"
          onClick={() => {
            const nextPath = parentPath(currentPath)
            if (nextPath) {
              updateWindowPayload(windowId, { currentPath: nextPath })
            }
          }}
        >
          <RefreshCcw size={16} />
          Up
        </button>
        <button
          className="pill-button"
          onClick={() => {
            void (async () => {
              const nextFile = await duplicateIntoDirectory(currentPath, 'new-note', 'md')
              await writeTextFile(nextFile, '# New note\n')
              markFsDirty()
              await openTarget(nextFile)
            })()
          }}
        >
          <Plus size={16} />
          New note
        </button>
        <button
          className="pill-button is-accent"
          onClick={() => {
            void (async () => {
              const folderName = `folder-${Math.floor(Date.now() / 1000)}`
              await mkdir(currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`)
              markFsDirty()
            })()
          }}
        >
          <FolderPlus size={16} />
          New folder
        </button>
        <span className="toolbar-spacer" />
        <span className="status-chip mono">{currentPath}</span>
      </div>

      <div className="app-panel list-shell">
        {error ? <div className="empty-state">{error}</div> : null}
        {!error && entries.length === 0 ? (
          <div className="empty-state">This folder is empty. Create something from Terminal or Explorer.</div>
        ) : null}

        {entries.map((entry) => {
          const isSelected = selectedPath === entry.path
          return (
            <button
              key={entry.path}
              className={`file-row ${isSelected ? 'is-selected' : ''}`}
              onClick={() => setSelectedPath(entry.path)}
              onDoubleClick={() => {
                if (entry.kind === 'directory') {
                  startTransition(() => {
                    updateWindowPayload(windowId, { currentPath: entry.path })
                  })
                  return
                }

                void openTarget(entry.path)
              }}
            >
              {entry.kind === 'directory' ? <FolderClosed size={18} /> : <File size={18} />}
              <span style={{ textAlign: 'left' }}>
                <strong>{entry.name}</strong>
                <span className="file-meta">{entry.kind === 'directory' ? 'Directory' : 'Text document'}</span>
              </span>
              <span className="file-meta">{entry.kind === 'directory' ? basename(entry.path) : 'Open'}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
