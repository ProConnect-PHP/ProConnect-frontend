import { ApiClientError } from '../../../core/http/models/api-error.model';

export function adminErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    if (error.status === 403) {
      return 'No tenes permisos para acceder al panel administrativo.';
    }

    if (error.status === 500) {
      return 'Ocurrio un error del servidor. Intenta nuevamente en unos minutos.';
    }

    return error.message || fallback;
  }

  return fallback;
}
