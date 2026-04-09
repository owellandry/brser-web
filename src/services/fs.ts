import { db } from './db'
import type { FileNode } from '../types'
import { basename, joinPath, parentPath } from '../utils/path'

function createNode(
  path: string,
  kind: FileNode['kind'],
  content = '',
  mime = 'text/plain',
): FileNode {
  const now = Date.now()

  return {
    path,
    name: basename(path),
    parentPath: parentPath(path),
    kind,
    content,
    createdAt: now,
    updatedAt: now,
    mime,
  }
}

function defaultWorkspace() {
  return [
    createNode('/', 'directory', '', 'inode/directory'),
    createNode('/Home', 'directory', '', 'inode/directory'),
    createNode('/Home/Notes', 'directory', '', 'inode/directory'),
    createNode('/Home/Projects', 'directory', '', 'inode/directory'),
    createNode('/Home/Media', 'directory', '', 'inode/directory'),
    createNode(
      '/Home/Notes/Field Notes.md',
      'file',
      '# Field Notes\n\nWelcome to Brser Virtual OS.\n\n- Type `help` in Terminal.\n- Use Explorer to inspect the filesystem.\n- Edit this note and reload to see persistence.\n',
      'text/markdown',
    ),
    createNode(
      '/Home/Projects/roadmap.txt',
      'file',
      'MVP goals:\n1. Desktop shell\n2. WASM-powered terminal parsing\n3. IndexedDB-backed filesystem\n',
    ),
    createNode(
      '/Home/Media/embeds.txt',
      'file',
      'Try `open app://docs` or paste an embeddable YouTube URL.\n',
    ),
  ]
}

export async function seedFileSystem() {
  const count = await db.files.count()
  if (count > 0) {
    return
  }

  await db.files.bulkPut(defaultWorkspace())
}

export async function resetFileSystem() {
  await db.files.clear()
  await seedFileSystem()
}

export async function getNode(path: string) {
  return db.files.get(path)
}

export async function listDirectory(path: string) {
  const directory = await getNode(path)
  if (!directory || directory.kind !== 'directory') {
    throw new Error(`Directory not found: ${path}`)
  }

  const items = await db.files.where('parentPath').equals(path).toArray()
  return items.sort((left, right) => {
    if (left.kind !== right.kind) {
      return left.kind === 'directory' ? -1 : 1
    }

    return left.name.localeCompare(right.name)
  })
}

export async function readTextFile(path: string) {
  const file = await getNode(path)
  if (!file || file.kind !== 'file') {
    throw new Error(`File not found: ${path}`)
  }

  return file.content
}

export async function mkdir(path: string) {
  const existing = await getNode(path)
  if (existing) {
    if (existing.kind !== 'directory') {
      throw new Error(`A file already exists at ${path}`)
    }

    return existing
  }

  const parent = parentPath(path)
  if (parent) {
    const parentNode = await getNode(parent)
    if (!parentNode || parentNode.kind !== 'directory') {
      throw new Error(`Cannot create directory without parent: ${path}`)
    }
  }

  const directory = createNode(path, 'directory', '', 'inode/directory')
  await db.files.put(directory)
  return directory
}

export async function writeTextFile(path: string, content: string) {
  const parent = parentPath(path)
  if (!parent) {
    throw new Error('Cannot write to root')
  }

  const parentNode = await getNode(parent)
  if (!parentNode || parentNode.kind !== 'directory') {
    throw new Error(`Cannot write file without parent directory: ${path}`)
  }

  const existing = await getNode(path)
  const now = Date.now()

  const file: FileNode = existing
    ? {
        ...existing,
        kind: 'file',
        content,
        updatedAt: now,
      }
    : {
        path,
        name: basename(path),
        parentPath: parent,
        kind: 'file',
        content,
        createdAt: now,
        updatedAt: now,
        mime: path.endsWith('.md') ? 'text/markdown' : 'text/plain',
      }

  await db.files.put(file)
  return file
}

export async function touchFile(path: string) {
  const existing = await getNode(path)

  if (existing?.kind === 'directory') {
    throw new Error(`Cannot touch a directory: ${path}`)
  }

  if (existing) {
    await writeTextFile(path, existing.content)
    return
  }

  await writeTextFile(path, '')
}

export async function duplicateIntoDirectory(
  directoryPath: string,
  baseName: string,
  suffix: string,
) {
  let attempt = 1
  let candidate = joinPath(directoryPath, `${baseName}.${suffix}`)

  while (await getNode(candidate)) {
    candidate = joinPath(directoryPath, `${baseName}-${attempt}.${suffix}`)
    attempt += 1
  }

  return candidate
}
