import { ApiClientError } from '../../../core/http/models/api-error.model';

export function mapVideoSessionError(errorCode?: string, fallback?: string): string {
  switch (errorCode) {
    case 'VideoSessionNotAllowedForModality':
      return 'Esta reserva no requiere sesion virtual.';
    case 'BookingNotEligibleForVideoSession':
      return 'Esta reserva no puede crear una sesion virtual.';
    case 'VideoSessionNotFound':
      return 'Esta reserva todavia no tiene sesion virtual.';
    case 'VideoSessionJoinWindowClosed':
      return 'Todavia no podes unirte a esta sesion o la ventana ya finalizo.';
    case 'VideoSessionCancelled':
      return 'Esta sesion virtual fue cancelada.';
    case 'VideoSessionEnded':
      return 'Esta sesion virtual ya finalizo.';
    case 'VideoSessionAlreadyEnded':
      return 'Esta sesion virtual ya fue finalizada.';
    case 'ProfessionalProfileRequired':
      return 'Necesitas completar tu perfil profesional.';
    case 'Forbidden':
    case 'FORBIDDEN':
      return 'No tenes permisos para acceder a esta sesion.';
    case 'ValidationError':
      return 'Revisa los datos enviados.';
    default:
      return fallback ?? 'No pudimos procesar la sesion virtual.';
  }
}

export function mapVideoSessionApiError(error: unknown, fallback?: string): string {
  if (error instanceof ApiClientError) {
    return mapVideoSessionError(error.type, error.message || fallback);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback ?? 'No pudimos procesar la sesion virtual.';
}

export function isVideoSessionNotFoundError(error: unknown): boolean {
  return error instanceof ApiClientError && (error.type === 'VideoSessionNotFound' || error.status === 404);
}
