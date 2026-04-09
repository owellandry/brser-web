import { db } from './db'
import type { SessionSnapshot } from '../types'

const SESSION_KEY = 'session'

export async function loadSessionSnapshot() {
  const entry = await db.kv.get(SESSION_KEY)
  return (entry?.value as SessionSnapshot | undefined) ?? null
}

export async function saveSessionSnapshot(snapshot: SessionSnapshot) {
  await db.kv.put({
    key: SESSION_KEY,
    value: snapshot,
  })
}

export async function clearSessionSnapshot() {
  await db.kv.delete(SESSION_KEY)
}
