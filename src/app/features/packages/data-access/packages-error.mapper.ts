import { ApiClientError } from '../../../core/http/models/api-error.model';

export function mapPackageError(errorCode?: string, fallback?: string): string {
  switch (errorCode) {
    case 'EmailNotVerified':
    case 'EMAIL_NOT_VERIFIED':
      return 'Debes verificar tu correo electrónico para realizar esta acción.';

    case 'ProfessionalProfileRequired':
      return 'Necesitas completar tu perfil profesional para gestionar paquetes.';
    case 'PackageNotAvailable':
      return 'Este paquete no esta disponible.';
    case 'CannotPurchaseOwnPackage':
      return 'No podes comprar tu propio paquete.';
    case 'ClientPackageNotActive':
      return 'Este paquete no esta activo.';
    case 'ClientPackageExpired':
      return 'Este paquete vencio.';
    case 'ClientPackageDepleted':
      return 'Este paquete no tiene sesiones disponibles.';
    case 'ClientPackageServiceMismatch':
      return 'Este paquete no aplica para este servicio.';
    case 'ClientPackageProfessionalMismatch':
      return 'Este paquete no corresponde a este profesional.';
    case 'BookingAlreadyUsesPackage':
      return 'Esta reserva ya tiene una sesion de paquete asociada.';
    case 'Forbidden':
    case 'FORBIDDEN':
      return 'No tenes permisos para realizar esta accion.';
    case 'ValidationError':
      return 'Revisa los datos ingresados.';
    default:
      return fallback ?? 'No pudimos procesar la operacion del paquete.';
  }
}

export function mapPackageApiError(error: unknown, fallback?: string): string {
  if (error instanceof ApiClientError) {
    return mapPackageError(error.code ?? error.type, error.message || fallback);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback ?? 'No pudimos procesar la operacion del paquete.';
}
