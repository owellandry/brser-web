import Dexie, { type Table } from 'dexie'
import type { FileNode, KeyValueEntry } from '../types'

class BrserVirtualOSDatabase extends Dexie {
  files!: Table<FileNode, string>
  kv!: Table<KeyValueEntry, string>

  constructor() {
    super('brser-virtual-os')

    this.version(1).stores({
      files: '&path, parentPath, kind, updatedAt',
      kv: '&key',
    })
  }
}

export const db = new BrserVirtualOSDatabase()
