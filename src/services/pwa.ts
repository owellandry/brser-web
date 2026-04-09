import { Workbox } from 'workbox-window'
import { useOSStore } from '../store/osStore'

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) {
    return
  }

  const workbox = new Workbox('/sw.js')
  workbox.addEventListener('activated', () => {
    useOSStore.getState().setPwaReady(true)
  })
  void workbox.register()
}
