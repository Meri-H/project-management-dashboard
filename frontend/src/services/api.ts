import { parseApiError } from '../utils/errors'
import {
  AUTH_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
} from '../utils/authStorage'


export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL

  if (!base || typeof base !== 'string') {
    throw new Error('VITE_API_BASE_URL is not configured')
  }

  return base.replace(/\/$/, '')
}

export function buildUrl(
  path: string,
  query?: Record<string, string | number | undefined>,
): string {
  const url = new URL(
    path.startsWith('/') ? path : `/${path}`,
    `${getApiBaseUrl()}/`,
  )

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
  asBlob?: boolean
  auth?: boolean
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers,
    query,
    asBlob = false,
    auth = true,
  } = options

  const requestHeaders = new Headers(headers)

  if (auth) {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)

    if (!token) {
      throw new Error('You must be logged in to continue')
    }

    requestHeaders.set(
      'Authorization',
      `Bearer ${token}`,
    )
  }

  const response = await fetch(
    buildUrl(path, query),
    {
      method,
      body,
      headers: requestHeaders,
    },
  )
if (response.status === 401 && auth) {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(AUTH_STORAGE_KEY)

  window.location.replace('/')

  return Promise.reject(
    new Error('Your session has expired. Please log in again.')
  )
}

  if (!response.ok) {
    throw await parseApiError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  if (asBlob) {
    return (await response.blob()) as T
  }

  const contentType =
    response.headers.get('content-type') ?? ''

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
    auth?: boolean
  } = {},
): Promise<T> {
  const headers = new Headers({
    Accept: 'application/json',
  })

  let body: BodyInit | undefined

  if (options.body !== undefined) {
    headers.set(
      'Content-Type',
      'application/json',
    )

    body = JSON.stringify(options.body)
  }

  return apiRequest<T>(
    path,
    {
      method: options.method,
      query: options.query,
      headers,
      body,
      auth: options.auth,
    },
  )
}