import { ApiClientError } from '../../../core/http/models/api-error.model';

export function mapPaymentError(errorCode?: string, fallback?: string): string {
  if (errorCode === 'BookingNotPayable') {
    return 'Esta reserva ya no puede pagarse en su estado actual.';
  }

  if (errorCode === 'ProviderPaymentNotFound') {
    return 'No encontramos un pago asociado a este intento. Si no completaste el checkout, podés intentar nuevamente.';
  }

  switch (errorCode) {
    case 'EmailNotVerified':
    case 'EMAIL_NOT_VERIFIED':
      return 'Debes verificar tu correo electrónico para realizar esta acción.';

    case 'BookingNotPayable':
      return 'Solo podes pagar reservas confirmadas.';
    case 'BookingAlreadyPaid':
      return 'Esta reserva ya fue pagada.';
    case 'PaymentIntentExpired':
      return 'El intento de pago expiro. Genera un nuevo intento.';
    case 'PaymentIntentNotProcessable':
      return 'Este intento de pago no puede procesarse.';
    case 'PaymentIntentNotSyncable':
      return 'Este intento de pago ya no puede sincronizarse.';
    case 'ProviderPaymentNotFound':
      return 'Todavía no encontramos un pago asociado a este intento.';
    case 'ProviderPaymentAmountMismatch':
      return 'El monto confirmado por el proveedor no coincide.';
    case 'ProviderCurrencyMismatch':
      return 'La moneda confirmada por el proveedor no coincide.';
    case 'ProviderPaymentRejected':
    case 'PaymentRejected':
      return 'El proveedor rechazó este pago. Podés intentar nuevamente con otro medio de pago.';
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
    const errorCode = error.code ?? error.type;

    if (isControlledPaymentError(errorCode)) {
      return mapPaymentError(errorCode, error.message || fallback);
    }

    if (error.code === 'EMAIL_NOT_VERIFIED' || error.type === 'EmailNotVerified') {
      return mapPaymentError(error.code ?? error.type, error.message || fallback);
    }

    if (error.status === 409) {
      return 'El pago o el recurso asociado cambio de estado. Actualiza la pagina e intenta nuevamente.';
    }

    if (error.status === 422) {
      return 'La reserva o el paquete ya no puede ser pagado con estos datos.';
    }

    if (error.status === 502) {
      return 'El proveedor de pagos no respondio correctamente. Proba nuevamente.';
    }

    return mapPaymentError(errorCode, error.message || fallback);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback ?? 'No pudimos procesar el pago.';
}

function isControlledPaymentError(errorCode: string | undefined): boolean {
  return [
    'BookingNotPayable',
    'BookingAlreadyPaid',
    'PaymentIntentExpired',
    'PaymentIntentNotProcessable',
    'PaymentIntentNotSyncable',
    'ProviderPaymentNotFound',
    'ProviderPaymentAmountMismatch',
    'ProviderCurrencyMismatch',
    'ProviderPaymentRejected',
    'PaymentRejected',
  ].includes(errorCode ?? '');
}
