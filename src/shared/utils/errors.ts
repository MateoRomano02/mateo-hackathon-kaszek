export type ErrorPersonalizado = { estado?: number; mensaje: string }

export const obtenerMensajeError = (error: unknown): ErrorPersonalizado => {
  let mensaje = 'An error occurred. Please contact the system administrator'
  let estado = 0

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    typeof (error as Record<string, unknown>).status === 'number'
  ) {
    // Anthropic SDK APIError or HTTP-like error
    const httpError = error as { status: number; message?: string }
    estado = httpError.status
    if (estado >= 400 && estado < 500) {
      mensaje = httpError.message ?? 'Could not complete the operation.'
    } else {
      mensaje = 'An error occurred connecting to the AI service. Please try again later'
    }
    if (estado === 401) {
      mensaje = 'Invalid or unconfigured API Key.'
    }
    if (estado === 429) {
      mensaje = 'Too many requests. Please wait a moment.'
    }
  } else if (error instanceof Error) {
    mensaje = error.message
  }

  return { estado, mensaje }
}
