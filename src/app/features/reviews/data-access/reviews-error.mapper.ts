import { ApiClientError } from '../../../core/http/models/api-error.model';

export function mapReviewError(errorCode?: string, fallback?: string): string {
  switch (errorCode) {
    case 'EmailNotVerified':
    case 'EMAIL_NOT_VERIFIED':
      return 'Debes verificar tu correo electrónico para realizar esta acción.';

    case 'BookingNotCompleted':
      return 'Solo podes reseñar reservas finalizadas.';
    case 'BookingAlreadyReviewed':
      return 'Esta reserva ya tiene una reseña.';
    case 'ReviewEditWindowExpired':
      return 'Ya no es posible modificar esta reseña.';
    case 'ReviewAlreadyReplied':
      return 'Esta reseña ya tiene una respuesta profesional.';
    case 'ProfessionalProfileRequired':
      return 'Necesitas un perfil profesional para responder reseñas.';
    case 'Forbidden':
    case 'FORBIDDEN':
      return 'No tenes permisos para realizar esta accion.';
    case 'ValidationError':
      return fallback ?? 'Revisa los campos marcados e intenta nuevamente.';
    default:
      return fallback ?? 'No pudimos procesar la operacion.';
  }
}

export function mapReviewApiError(error: unknown, fallback?: string): string {
  if (error instanceof ApiClientError) {
    return mapReviewError(error.code ?? error.type, error.message || fallback);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback ?? 'No pudimos procesar la operacion.';
}

export function reviewFieldErrors(error: unknown, field: string): string[] {
  if (!(error instanceof ApiClientError)) return [];

  return error.details?.[field] ?? [];
}
