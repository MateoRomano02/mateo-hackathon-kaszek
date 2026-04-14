export type AppError = {
  status: number
  message: string
}

/**
 * Normalizes any thrown value into a typed AppError.
 * Drop-in compatible with the Axios-based pattern — swap the
 * instanceof branch when adding Axios to the project.
 */
export function getErrorMessage(error: unknown): AppError {
  let message = 'Ocurrió un error. Consultá al administrador del sistema.'
  let status = 0

  if (error instanceof ApiError) {
    status = error.status
    const isClientError = status >= 400 && status < 500

    message = isClientError
      ? (error.serverMessage ?? 'No se pudo completar la operación.')
      : 'Ocurrió un error al conectarse al backend. Intentá de nuevo más tarde.'

    if (status === 400 && !error.serverMessage) {
      message = 'Solicitud inválida.'
    }
  } else if (error instanceof Error) {
    message = error.message
  }

  return { status, message }
}

/** Throw this from service functions instead of raw Error */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly serverMessage?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
