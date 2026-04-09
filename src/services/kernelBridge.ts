import initWasm, {
  exec_command as wasmExecCommand,
  init_kernel as wasmInitKernel,
  resolve_path as wasmResolvePath,
} from '../../wasm-kernel/pkg/wasm_kernel'
import type { CommandExecutionResult, ParsedKernelCommand } from '../types'
import { listDirectory, mkdir, readTextFile, touchFile, writeTextFile } from './fs'
import { resolveOpenTarget } from './openTarget'

let initPromise: Promise<string> | null = null

function formatDirectoryListing(entries: Awaited<ReturnType<typeof listDirectory>>) {
  if (entries.length === 0) {
    return 'Directory is empty.'
  }

  return entries
    .map((entry) => (entry.kind === 'directory' ? `${entry.name}/` : entry.name))
    .join('   ')
}

async function ensureKernel() {
  if (!initPromise) {
    initPromise = (async () => {
      await initWasm()
      return wasmInitKernel()
    })()
  }

  return initPromise
}

export const kernelBridge = {
  async initKernel() {
    return ensureKernel()
  },

  async resolvePath(input: string, cwd: string) {
    await ensureKernel()
    return wasmResolvePath(input, cwd)
  },

  async listDir(path: string) {
    await ensureKernel()
    return listDirectory(path)
  },

  async readFile(path: string) {
    await ensureKernel()
    return readTextFile(path)
  },

  async writeFile(path: string, content: string) {
    await ensureKernel()
    return writeTextFile(path, content)
  },

  async mkdir(path: string) {
    await ensureKernel()
    return mkdir(path)
  },

  async exec(commandLine: string, cwd: string): Promise<CommandExecutionResult> {
    await ensureKernel()
    const parsed = wasmExecCommand(commandLine, cwd) as ParsedKernelCommand

    switch (parsed.operation) {
      case 'help':
        return {
          cwd,
          lines: [
            {
              kind: 'system',
              content:
                'Commands: help, ls, cd, pwd, cat, mkdir, touch, echo, clear, open',
            },
          ],
        }
      case 'ls': {
        const target = parsed.target ?? cwd
        const entries = await listDirectory(target)
        return {
          cwd,
          lines: [{ kind: 'output', content: formatDirectoryListing(entries) }],
        }
      }
      case 'cd': {
        const target = parsed.target ?? '/Home'
        await listDirectory(target)
        return {
          cwd: target,
          lines: [],
        }
      }
      case 'pwd':
        return {
          cwd,
          lines: [{ kind: 'output', content: cwd }],
        }
      case 'cat': {
        const target = parsed.target
        if (!target) {
          throw new Error('cat needs a file path')
        }
        const content = await readTextFile(target)
        return {
          cwd,
          lines: [{ kind: 'output', content }],
        }
      }
      case 'mkdir': {
        const target = parsed.target
        if (!target) {
          throw new Error('mkdir needs a directory path')
        }
        await mkdir(target)
        return {
          cwd,
          lines: [{ kind: 'system', content: `Created ${target}` }],
          fsChanged: true,
        }
      }
      case 'touch': {
        const target = parsed.target
        if (!target) {
          throw new Error('touch needs a file path')
        }
        await touchFile(target)
        return {
          cwd,
          lines: [{ kind: 'system', content: `Touched ${target}` }],
          fsChanged: true,
        }
      }
      case 'echo': {
        const text = parsed.text ?? ''
        if (parsed.redirect) {
          await writeTextFile(parsed.redirect, text)
          return {
            cwd,
            lines: [{ kind: 'system', content: `Wrote ${parsed.redirect}` }],
            fsChanged: true,
          }
        }

        return {
          cwd,
          lines: [{ kind: 'output', content: text }],
        }
      }
      case 'clear':
        return {
          cwd,
          lines: [],
          clear: true,
        }
      case 'open': {
        const target = parsed.target
        if (!target) {
          throw new Error('open needs a path or URL')
        }
        return {
          cwd,
          lines: [{ kind: 'system', content: `Opening ${target}` }],
          openTarget: await resolveOpenTarget(target),
        }
      }
      default:
        return {
          cwd,
          lines: [{ kind: 'error', content: `Unknown command: ${parsed.command}` }],
        }
    }
  },
}
