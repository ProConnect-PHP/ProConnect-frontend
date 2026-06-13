import { ApiClientError } from '../../../core/http/models/api-error.model';

export function mapPaymentError(errorCode?: string, fallback?: string): string {
  switch (errorCode) {
    case 'BookingNotPayable':
      return 'Solo podes pagar reservas confirmadas.';
    case 'BookingAlreadyPaid':
      return 'Esta reserva ya fue pagada.';
    case 'PaymentIntentExpired':
      return 'El intento de pago expiro. Genera un nuevo intento.';
    case 'PaymentIntentNotProcessable':
      return 'Este intento de pago no puede procesarse.';
    case 'ProfessionalProfileRequired':
      return 'Necesitas un perfil profesional para ver estos pagos.';
    case 'Forbidden':
    case 'FORBIDDEN':
      return 'No tenes permisos para realizar esta operacion.';
    case 'ValidationError':
      return 'Revisa los datos enviados.';
    default:
      return fallback ?? 'No pudimos procesar el pago.';
  }
}

export function mapPaymentApiError(error: unknown, fallback?: string): string {
  if (error instanceof ApiClientError) {
    if (error.status === 409) {
      return 'El pago o el recurso asociado cambio de estado. Actualiza la pagina e intenta nuevamente.';
    }

    if (error.status === 422) {
      return 'La reserva o el paquete ya no puede ser pagado con estos datos.';
    }

    if (error.status === 502) {
      return 'El proveedor de pagos no respondio correctamente. Proba nuevamente.';
    }

    return mapPaymentError(error.type, error.message || fallback);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback ?? 'No pudimos procesar el pago.';
}
