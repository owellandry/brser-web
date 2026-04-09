/**
 * ============================================================================
 * ARCHIVO: FileExplorerApp.tsx
 * PROPÓSITO: Explorador de archivos del sistema NEXUS OS
 * ARQUITECTURA: Hexagonal - Capa de Aplicación (Caso de Uso) / UI
 * LÍMITE DE LÍNEAS: < 200
 * ============================================================================
 * Permite navegar por el sistema de archivos virtual, crear carpetas y
 * abrir documentos o directorios en sus respectivas aplicaciones.
 */

import { startTransition, useEffect, useState } from 'react'
import { MdFolder, MdInsertDriveFile, MdCreateNewFolder, MdHome, MdArrowUpward, MdNoteAdd } from 'react-icons/md'
import type { FileNode } from '../types'
import { duplicateIntoDirectory, listDirectory, mkdir, writeTextFile } from '../services/fs'
import { resolveOpenTarget } from '../services/openTarget'
import { useOSStore } from '../store/osStore'
import { basename, parentPath } from '../utils/path'

interface FileExplorerAppProps {
  /** ID de la ventana que contiene esta instancia del explorador */
  windowId: string
}

/**
 * COMPONENTE: FileExplorerApp
 * Renderiza la interfaz del gestor de archivos.
 */
export function FileExplorerApp({ windowId }: FileExplorerAppProps) {
  // --- ESTADO GLOBAL (Store) ---
  const windowState = useOSStore((state) => state.windows.find((window) => window.id === windowId))
  const updateWindowPayload = useOSStore((state) => state.updateWindowPayload)
  const openApp = useOSStore((state) => state.openApp)
  const fsRevision = useOSStore((state) => state.fsRevision)
  const markFsDirty = useOSStore((state) => state.markFsDirty)

  // --- ESTADO LOCAL ---
  const currentPath =
    windowState && typeof windowState.payload.currentPath === 'string'
      ? windowState.payload.currentPath
      : '/Home'

  const [entries, setEntries] = useState<FileNode[]>([])
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // --- EFECTOS ---
  
  // Cargar contenido del directorio actual
  useEffect(() => {
    let alive = true

    void listDirectory(currentPath)
      .then((items) => {
        if (!alive) return
        setEntries(items)
        setError(null)
      })
      .catch((loadError: unknown) => {
        if (!alive) return
        setError(loadError instanceof Error ? loadError.message : 'Could not list directory.')
      })

    return () => { alive = false }
  }, [currentPath, fsRevision])

  if (!windowState) return null

  // --- MÉTODOS DE DOMINIO ---

  /** Abre un archivo o carpeta en la app correspondiente usando el Router virtual */
  async function openTarget(path: string) {
    const openInstruction = await resolveOpenTarget(path)
    openApp(openInstruction.appId, openInstruction.payload)
  }

  /** Sube un nivel en el árbol de directorios */
  const handleNavigateUp = () => {
    const nextPath = parentPath(currentPath)
    if (nextPath) updateWindowPayload(windowId, { currentPath: nextPath })
  }

  /** Crea un nuevo archivo de texto en la ruta actual */
  const handleCreateNote = async () => {
    const nextFile = await duplicateIntoDirectory(currentPath, 'new-note', 'md')
    await writeTextFile(nextFile, '# New note\n')
    markFsDirty()
    await openTarget(nextFile)
  }

  /** Crea un nuevo directorio en la ruta actual */
  const handleCreateFolder = async () => {
    const folderName = `folder-${Math.floor(Date.now() / 1000)}`
    await mkdir(currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`)
    markFsDirty()
  }

  // --- RENDERIZADO ---
  return (
    <section className="app-surface">
      {/* Barra de herramientas (Acciones) */}
      <div className="app-toolbar">
        <button
          className="ghost-button"
          onClick={() => updateWindowPayload(windowId, { currentPath: '/Home' })}
          title="Go to Home"
        >
          <MdHome size={18} />
          Home
        </button>
        <button
          className="ghost-button"
          onClick={handleNavigateUp}
          title="Navigate Up"
        >
          <MdArrowUpward size={18} />
          Up
        </button>
        <button
          className="pill-button"
          onClick={handleCreateNote}
        >
          <MdNoteAdd size={18} />
          New note
        </button>
        <button
          className="pill-button is-accent"
          onClick={handleCreateFolder}
        >
          <MdCreateNewFolder size={18} />
          New folder
        </button>
        <span className="toolbar-spacer" />
        <span className="status-chip mono">{currentPath}</span>
      </div>

      {/* Panel principal (Lista de archivos) */}
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
                } else {
                  void openTarget(entry.path)
                }
              }}
            >
              {entry.kind === 'directory' ? <MdFolder size={24} color="#00e5ff" /> : <MdInsertDriveFile size={24} color="#a1afbe" />}
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
