import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const repoDir = path.resolve(rootDir, '..')

const eslint = new ESLint({
  cwd: repoDir,
  overrideConfigFile: path.join(repoDir, 'eslint.config.js'),
  suppressionsLocation: path.join(repoDir, '.eslint-suppressions.json'),
})

const results = await eslint.lintFiles(['src/**/*.ts', 'src/**/*.tsx', 'vite.config.ts', 'playwright.config.ts'])
const formatter = await eslint.loadFormatter('stylish')
const output = formatter.format(results)

if (output) {
  console.log(output)
}

const totalErrors = results.reduce((count, result) => count + result.errorCount, 0)
const totalWarnings = results.reduce((count, result) => count + result.warningCount, 0)

if (totalErrors > 0 || totalWarnings > 0) {
  process.exitCode = 1
}
