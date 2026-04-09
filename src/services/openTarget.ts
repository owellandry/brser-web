import type { AppId, WindowPayload } from '../types'
import { getNode } from './fs'
import { isTextLikeFile } from '../utils/path'

export async function resolveOpenTarget(target: string): Promise<{
  appId: AppId
  payload: WindowPayload
}> {
  if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('app://')) {
    return {
      appId: 'browser',
      payload: { location: target },
    }
  }

  const node = await getNode(target)
  if (!node) {
    throw new Error(`Cannot open missing target: ${target}`)
  }

  if (node.kind === 'directory') {
    return {
      appId: 'explorer',
      payload: { currentPath: target },
    }
  }

  if (isTextLikeFile(target)) {
    return {
      appId: 'notes',
      payload: { path: target },
    }
  }

  return {
    appId: 'browser',
    payload: { location: 'app://docs' },
  }
}
