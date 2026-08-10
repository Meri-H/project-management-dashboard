import { parseApiError } from '../utils/errors'
import { AUTH_STORAGE_KEY } from '../utils/authStorage'

export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL
  if (!base || typeof base !== 'string') {
    throw new Error('VITE_API_BASE_URL is not configured')
  }
  return base.replace(/\/$/, '')
}

/**
 * Current-user identity for backend query params (user_id / owner_id).
 * Isolated here so JWT can replace localStorage later without rewriting pages.
 */
export function getCurrentUserId(): number {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) {
    throw new Error('You must be logged in to continue')
  }

  try {
    const user = JSON.parse(raw) as { id?: number }
    if (typeof user.id !== 'number') {
      throw new Error('Invalid stored user')
    }
    return user.id
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid stored user') {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
    throw new Error('You must be logged in to continue')
  }
}

export function buildUrl(
  path: string,
  query?: Record<string, string | number | undefined>,
): string {
  const url = new URL(path.startsWith('/') ? path : `/${path}`, `${getApiBaseUrl()}/`)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  return url.toString()
}

type RequestOptions = {
  method?: string
  body?: BodyInit | null
  headers?: HeadersInit
  query?: Record<string, string | number | undefined>
  /** When true, response is returned as Blob (for FileResponse downloads). */
  asBlob?: boolean
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers, query, asBlob = false } = options

  const response = await fetch(buildUrl(path, query), {
    method,
    body,
    headers,
  })

  if (!response.ok) {
    throw await parseApiError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  if (asBlob) {
    return (await response.blob()) as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return (await response.json()) as T
  }

  return undefined as T
}

export async function apiJson<T>(
  path: string,
  options: {
    method?: string
    body?: unknown
    query?: Record<string, string | number | undefined>
  } = {},
): Promise<T> {
  const headers: HeadersInit = {
    Accept: 'application/json',
  }

  let body: BodyInit | undefined
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.body)
  }

  return apiRequest<T>(path, {
    method: options.method,
    query: options.query,
    headers,
    body,
  })
}
