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
    return mapPaymentError(error.type, error.message || fallback);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback ?? 'No pudimos procesar el pago.';
}
