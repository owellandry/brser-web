import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import {
  getNode,
  listDirectory,
  readTextFile,
  resetFileSystem,
  seedFileSystem,
  writeTextFile,
} from './fs'

describe('filesystem service', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    await seedFileSystem()
  })

  it('seeds a default workspace', async () => {
    const home = await getNode('/Home')
    expect(home?.kind).toBe('directory')
  })

  it('writes and reloads text files', async () => {
    await writeTextFile('/Home/Notes/Session.md', 'hello world')
    const content = await readTextFile('/Home/Notes/Session.md')
    expect(content).toBe('hello world')
  })

  it('lists new files after reset and reseed', async () => {
    await resetFileSystem()
    const entries = await listDirectory('/Home/Notes')
    expect(entries.some((entry) => entry.path === '/Home/Notes/Field Notes.md')).toBe(true)
  })
})
