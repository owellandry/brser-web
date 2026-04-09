import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { appRegistry, defaultPreferences, deriveWindowTitle } from '../data/apps'
import { kernelBridge } from '../services/kernelBridge'
import { resetFileSystem, seedFileSystem } from '../services/fs'
import {
  clearSessionSnapshot,
  loadSessionSnapshot,
  saveSessionSnapshot,
} from '../services/session'
import { closeWindowSet, createWindowRecord, focusWindowSet } from '../services/windowManager'
import type {
  AppId,
  Preferences,
  SessionSnapshot,
  WindowPayload,
  WindowState,
} from '../types'

interface OSState {
  bootState: 'loading' | 'ready' | 'error'
  bootMessage: string
  windows: WindowState[]
  preferences: Preferences
  launcherOpen: boolean
  singleWindowMode: boolean
  fsRevision: number
  pwaReady: boolean
  hydrate: () => Promise<void>
  openApp: (appId: AppId, payload?: WindowPayload) => string | null
  closeWindow: (windowId: string) => void
  focusWindow: (windowId: string) => void
  minimizeWindow: (windowId: string) => void
  toggleMaximizeWindow: (windowId: string) => void
  updateWindowBounds: (windowId: string, bounds: WindowState['bounds']) => void
  updateWindowPayload: (windowId: string, payload: WindowPayload) => void
  toggleLauncher: () => void
  setSingleWindowMode: (singleWindowMode: boolean) => void
  setPreference: <TKey extends keyof Preferences>(key: TKey, value: Preferences[TKey]) => void
  markFsDirty: () => void
  resetWorkspace: () => Promise<void>
  setPwaReady: (ready: boolean) => void
}

function buildDefaultWindows() {
  const explorer = createWindowRecord('explorer', { currentPath: '/Home' }, [])
  const terminal = createWindowRecord('terminal', { cwd: '/Home' }, [explorer])
  return focusWindowSet([explorer, terminal], terminal.id)
}

function normalizeHydratedWindows(windows: WindowState[]) {
  if (windows.length === 0) {
    return buildDefaultWindows()
  }

  const sorted = [...windows].sort((left, right) => left.zIndex - right.zIndex)
  const focused = [...sorted]
    .filter((window) => window.status !== 'minimized')
    .sort((left, right) => right.zIndex - left.zIndex)[0]

  return sorted.map((window, index) => ({
    ...window,
    zIndex: 20 + index,
    isFocused: focused ? window.id === focused.id : false,
    title: deriveWindowTitle(window.appId, window.payload),
  }))
}

let hydratePromise: Promise<void> | null = null

export const useOSStore = create<OSState>()(
  subscribeWithSelector((set, get) => ({
    bootState: 'loading',
    bootMessage: 'Waking the shell, mounting the kernel and restoring your workspace.',
    windows: [],
    preferences: { ...defaultPreferences },
    launcherOpen: false,
    singleWindowMode: false,
    fsRevision: 0,
    pwaReady: false,
    async hydrate() {
      if (hydratePromise) {
        return hydratePromise
      }

      hydratePromise = (async () => {
        set({
          bootState: 'loading',
          bootMessage: 'Indexing local files and preparing the WASM kernel.',
        })

        await seedFileSystem()
        await kernelBridge.initKernel()

        const session = await loadSessionSnapshot()

        set({
          bootState: 'ready',
          bootMessage: 'Shell online.',
          preferences: session?.preferences ?? { ...defaultPreferences },
          windows: normalizeHydratedWindows(session?.windows ?? []),
        })
      })()
        .catch((error: unknown) => {
          set({
            bootState: 'error',
            bootMessage:
              error instanceof Error
                ? error.message
                : 'The shell could not be restored. Reload to retry.',
          })
        })
        .finally(() => {
          hydratePromise = null
        })

      return hydratePromise
    },
    openApp(appId, payload = {}) {
      const existing = get().windows.find(
        (window) => window.appId === appId && !appRegistry[appId].allowMultiple,
      )

      if (existing) {
        set({
          windows: focusWindowSet(
            get().windows.map((window) =>
              window.id === existing.id
                ? {
                    ...window,
                    payload: { ...window.payload, ...payload },
                    title: deriveWindowTitle(window.appId, {
                      ...window.payload,
                      ...payload,
                    }),
                  }
                : window,
            ),
            existing.id,
          ),
          launcherOpen: false,
        })
        return existing.id
      }

      const existingWindows = get().windows.map((window) => ({
        ...window,
        isFocused: false,
      }))
      const nextWindow = createWindowRecord(appId, payload, existingWindows)
      set({
        windows: [...existingWindows, nextWindow],
        launcherOpen: false,
      })
      return nextWindow.id
    },
    closeWindow(windowId) {
      set({
        windows: closeWindowSet(get().windows, windowId),
      })
    },
    focusWindow(windowId) {
      set({
        windows: focusWindowSet(get().windows, windowId),
        launcherOpen: false,
      })
    },
    minimizeWindow(windowId) {
      const nextWindows = get().windows.map((window) =>
        window.id === windowId
          ? {
              ...window,
              status: 'minimized' as const,
              isFocused: false,
            }
          : window,
      )

      const fallback = [...nextWindows]
        .filter((window) => window.status !== 'minimized')
        .sort((left, right) => right.zIndex - left.zIndex)[0]

      set({
        windows: nextWindows.map((window) => ({
          ...window,
          isFocused: fallback ? window.id === fallback.id : false,
        })),
      })
    },
    toggleMaximizeWindow(windowId) {
      set({
        windows: focusWindowSet(
          get().windows.map((window) =>
            window.id === windowId
              ? {
                  ...window,
                  status: window.status === 'maximized' ? 'normal' : 'maximized',
                }
              : window,
          ),
          windowId,
        ),
      })
    },
    updateWindowBounds(windowId, bounds) {
      set({
        windows: get().windows.map((window) =>
          window.id === windowId && window.status === 'normal'
            ? { ...window, bounds }
            : window,
        ),
      })
    },
    updateWindowPayload(windowId, payload) {
      set({
        windows: get().windows.map((window) =>
          window.id === windowId
            ? {
                ...window,
                payload: { ...window.payload, ...payload },
                title: deriveWindowTitle(window.appId, { ...window.payload, ...payload }),
              }
            : window,
        ),
      })
    },
    toggleLauncher() {
      set({
        launcherOpen: !get().launcherOpen,
      })
    },
    setSingleWindowMode(singleWindowMode) {
      set({ singleWindowMode })
    },
    setPreference(key, value) {
      set({
        preferences: {
          ...get().preferences,
          [key]: value,
        },
      })
    },
    markFsDirty() {
      set({
        fsRevision: get().fsRevision + 1,
      })
    },
    async resetWorkspace() {
      await clearSessionSnapshot()
      await resetFileSystem()
      set({
        windows: buildDefaultWindows(),
        preferences: { ...defaultPreferences },
        fsRevision: get().fsRevision + 1,
        launcherOpen: false,
        bootState: 'ready',
        bootMessage: 'Workspace reset.',
      })
    },
    setPwaReady(ready) {
      set({
        pwaReady: ready,
      })
    },
  })),
)

let saveTimer: ReturnType<typeof setTimeout> | null = null

useOSStore.subscribe(
  (state) => ({
    bootState: state.bootState,
    windows: state.windows,
    preferences: state.preferences,
  }),
  (slice) => {
    if (slice.bootState !== 'ready') {
      return
    }

    if (saveTimer) {
      clearTimeout(saveTimer)
    }

    saveTimer = setTimeout(() => {
      const snapshot: SessionSnapshot = {
        windows: slice.windows,
        preferences: slice.preferences,
      }

      void saveSessionSnapshot(snapshot)
    }, 220)
  },
)
