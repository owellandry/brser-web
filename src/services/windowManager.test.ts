import { describe, expect, it } from 'vitest'
import { createWindowRecord, focusWindowSet } from './windowManager'

describe('window manager helpers', () => {
  it('creates cascaded windows with generated titles', () => {
    const explorer = createWindowRecord('explorer', { currentPath: '/Home' }, [])
    const terminal = createWindowRecord('terminal', { cwd: '/Home' }, [explorer])

    expect(explorer.title).toContain('Explorer')
    expect(terminal.bounds.x).toBeGreaterThan(explorer.bounds.x)
  })

  it('focuses a minimized window and brings it to the front', () => {
    const explorer = createWindowRecord('explorer', { currentPath: '/Home' }, [])
    const terminal = {
      ...createWindowRecord('terminal', { cwd: '/Home' }, [explorer]),
      status: 'minimized' as const,
      isFocused: false,
    }

    const focused = focusWindowSet([explorer, terminal], terminal.id)
    const target = focused.find((window) => window.id === terminal.id)

    expect(target?.status).toBe('normal')
    expect(target?.isFocused).toBe(true)
  })
})
