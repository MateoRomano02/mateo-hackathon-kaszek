export type ErrorPersonalizado = { estado?: number; mensaje: string }

export const obtenerMensajeError = (error: unknown): ErrorPersonalizado => {
  let mensaje = 'Ocurrio un error. Consulte al administrador del sistema'
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
      mensaje = httpError.message ?? 'No se pudo completar la operacion.'
    } else {
      mensaje = 'Ocurrio un error al conectarse al servicio de IA. Intente nuevamente mas tarde'
    }
    if (estado === 401) {
      mensaje = 'API Key invalida o no configurada.'
    }
    if (estado === 429) {
      mensaje = 'Demasiadas solicitudes. Espere un momento.'
    }
  } else if (error instanceof Error) {
    mensaje = error.message
  }

  return { estado, mensaje }
}
