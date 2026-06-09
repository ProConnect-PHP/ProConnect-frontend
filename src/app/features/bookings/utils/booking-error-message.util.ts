import { ApiClientError } from '../../../core/http/models/api-error.model';

export function bookingErrorMessage(
  error: unknown,
  fallback = 'No pudimos completar la operacion. Intenta nuevamente.',
): string {
  if (error instanceof ApiClientError) {
    return bookingErrorMessageFromType(error.type, error.message || fallback);
  }

  return fallback;
}

export function bookingErrorMessageFromType(
  errorType: string | undefined,
  fallback = 'No pudimos completar la operacion. Intenta nuevamente.',
): string {
  switch (errorType) {
    case 'BookingSlotAlreadyTaken':
      return 'Este horario ya fue reservado. Elegi otro horario.';
    case 'InvalidBookingSlot':
      return 'El horario seleccionado ya no esta disponible.';
    case 'CannotBookOwnService':
      return 'No podes reservar tu propio servicio.';
    case 'MaxBookingsPerClientReached':
      return 'Ya alcanzaste el maximo de reservas permitidas para este servicio.';
    case 'CancellationWindowExpired':
      return 'Ya no es posible cancelar esta reserva.';
    case 'RescheduleWindowExpired':
      return 'Ya no es posible reprogramar esta reserva.';
    case 'ProfessionalProfileRequired':
      return 'Necesitas crear un perfil profesional para gestionar reservas.';
    case 'InvalidBookingStatusTransition':
      return 'Esta reserva ya no permite esa accion.';
    case 'ServiceNotAvailable':
    case 'ServiceNotAvailableOnDate':
      return 'El servicio no esta disponible para ese horario.';
    default:
      return fallback;
  }
}
