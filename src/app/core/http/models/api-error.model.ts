export type ApiErrorType =
  | 'Unauthorized'
  | 'Forbidden'
  | 'NotFound'
  | 'ValidationError'
  | 'ProfessionalProfileAlreadyExists'
  | 'TooManyRequests'
  | 'InternalServerError'
  | 'HttpError'
  | string;

export type ApiValidationDetails = Record<string, string[]>;

export type ApiErrorPayload = {
  type: ApiErrorType;
  message: string;
  details: ApiValidationDetails | null;
};

export type ApiErrorResponse = {
  success: false;
  error: ApiErrorPayload;
};

export class ApiClientError extends Error {
  override readonly name = 'ApiClientError';

  constructor(
    message: string,
    readonly status: number,
    readonly type: ApiErrorType,
    readonly details: ApiValidationDetails | null = null,
  ) {
    super(message);
  }
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<ApiErrorResponse>;
  return candidate.success === false && typeof candidate.error?.message === 'string';
}

export function getFriendlyApiMessage(type: ApiErrorType, fallback: string): string {
  if (fallback && fallback.trim() !== '') {
    return fallback;
  }

  switch (type) {
    case 'Unauthorized':
      return 'Tu sesion expiro. Inicia sesion nuevamente.';
    case 'Forbidden':
      return 'No tenes permisos para realizar esta accion.';
    case 'NotFound':
      return 'No encontramos el recurso solicitado.';
    case 'ValidationError':
      return 'Revisa los campos marcados e intenta nuevamente.';
    case 'ProfessionalProfileAlreadyExists':
      return 'Ya tenes un perfil profesional creado.';
    case 'TooManyRequests':
      return 'Demasiados intentos. Espera un momento y volve a probar.';
    case 'InternalServerError':
      return 'Ocurrio un error del servidor. Intenta nuevamente en unos minutos.';
    default:
      return 'No pudimos completar la accion. Intenta nuevamente.';
  }
}
