import { appRegistry, deriveWindowTitle } from '../data/apps'
import type { AppId, Bounds, WindowPayload, WindowState, WindowStatus } from '../types'

export function createWindowRecord(
  appId: AppId,
  payload: WindowPayload,
  existingWindows: WindowState[],
): WindowState {
  const app = appRegistry[appId]
  const cascade = existingWindows.length % 6
  const zIndex = Math.max(10, ...existingWindows.map((window) => window.zIndex)) + 1
  const bounds: Bounds = {
    x: 72 + cascade * 28,
    y: 72 + cascade * 24,
    width: app.defaultSize.width,
    height: app.defaultSize.height,
  }

  return {
    id: crypto.randomUUID(),
    appId,
    title: deriveWindowTitle(appId, payload),
    bounds,
    status: 'normal',
    zIndex,
    isFocused: true,
    payload,
    createdAt: Date.now(),
  }
}

export function focusWindowSet(windows: WindowState[], windowId: string) {
  const nextZ = Math.max(10, ...windows.map((window) => window.zIndex)) + 1

  return windows.map((window) => {
    if (window.id !== windowId) {
      return {
        ...window,
        isFocused: false,
      }
    }

    return {
      ...window,
      isFocused: true,
      status: window.status === 'minimized' ? ('normal' as WindowStatus) : window.status,
      zIndex: nextZ,
    }
  })
}

export function closeWindowSet(windows: WindowState[], windowId: string) {
  const remaining = windows.filter((window) => window.id !== windowId)
  const fallback = [...remaining]
    .filter((window) => window.status !== 'minimized')
    .sort((left, right) => right.zIndex - left.zIndex)[0]

  return remaining.map((window) => ({
    ...window,
    isFocused: fallback ? window.id === fallback.id : false,
  }))
}
