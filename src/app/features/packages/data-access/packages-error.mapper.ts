import { ApiClientError } from '../../../core/http/models/api-error.model';

export type PackageProductFieldErrors = Partial<
  Record<
    'service_id' | 'name' | 'description' | 'sessions_count' | 'price' | 'validity_days' | 'is_active',
    string
  >
>;

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
    if (error.status === 401) {
      return 'Tu sesion expiro. Inicia sesion nuevamente.';
    }

    if (error.status === 403) {
      return 'No tenes permisos para crear paquetes.';
    }

    if (error.status >= 500) {
      return 'El servidor no pudo crear el paquete. Intenta nuevamente en unos minutos.';
    }

    return mapPackageError(error.code ?? error.type, error.message || fallback);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback ?? 'No pudimos procesar la operacion del paquete.';
}

export function mapPackageProductFieldErrors(error: unknown): PackageProductFieldErrors {
  if (!(error instanceof ApiClientError) || error.status !== 422 || !error.details) {
    return {};
  }

  const supportedFields = new Set<keyof PackageProductFieldErrors>([
    'service_id',
    'name',
    'description',
    'sessions_count',
    'price',
    'validity_days',
    'is_active',
  ]);

  return Object.entries(error.details).reduce<PackageProductFieldErrors>(
    (fieldErrors, [field, messages]) => {
      if (!supportedFields.has(field as keyof PackageProductFieldErrors) || !messages[0]) {
        return fieldErrors;
      }

      fieldErrors[field as keyof PackageProductFieldErrors] = messages[0];
      return fieldErrors;
    },
    {},
  );
}
