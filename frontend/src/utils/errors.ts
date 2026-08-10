export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

function messageForStatus(status: number): string {
  switch (status) {
    case 401:
      return 'Invalid email or password'
    case 403:
      return 'You do not have permission to perform this action'
    case 404:
      return 'The requested resource was not found or access was denied'
    case 409:
      return 'This action conflicts with existing data'
    case 422:
      return 'Please check your input and try again'
    default:
      return `Request failed (${status})`
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  let message = messageForStatus(response.status)

  try {
    const data: unknown = await response.json()
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>
      if (typeof record.error === 'string' && record.error.trim()) {
        message = record.error
      } else if (typeof record.detail === 'string' && record.detail.trim()) {
        message = record.detail
      } else if (Array.isArray(record.detail) && record.detail.length > 0) {
        const first = record.detail[0] as { msg?: string }
        if (typeof first?.msg === 'string') {
          message = first.msg
        }
      }
    }
  } catch {
    // Keep status-based fallback when body is not JSON.
  }

  return new ApiError(message, response.status)
}
