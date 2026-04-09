export function normalizeSlashes(value: string) {
  if (!value) {
    return '/'
  }

  const normalized = value.replace(/\\/g, '/').replace(/\/+/g, '/')
  return normalized === '' ? '/' : normalized
}

export function parentPath(path: string) {
  if (path === '/') {
    return null
  }

  const clean = normalizeSlashes(path).replace(/\/$/, '')
  const parts = clean.split('/').filter(Boolean)

  if (parts.length <= 1) {
    return '/'
  }

  return `/${parts.slice(0, -1).join('/')}`
}

export function basename(path: string) {
  if (path === '/') {
    return '/'
  }

  const clean = normalizeSlashes(path).replace(/\/$/, '')
  const parts = clean.split('/').filter(Boolean)
  return parts.at(-1) ?? '/'
}

export function joinPath(parent: string, child: string) {
  if (parent === '/') {
    return normalizeSlashes(`/${child}`)
  }

  return normalizeSlashes(`${parent}/${child}`)
}

export function isTextLikeFile(path: string) {
  return /\.(md|txt|json|js|ts|tsx|css|html|rs)$/i.test(path)
}
