export type ApiErrorType =
  | 'Unauthorized'
  | 'Forbidden'
  | 'NotFound'
  | 'ValidationError'
  | 'ProfessionalProfileAlreadyExists'
  | 'TooManyRequests'
  | 'EmailNotVerified'
  | 'InvalidEmailVerificationToken'
  | 'InternalServerError'
  | 'HttpError'
  | string;

export type ApiValidationDetails = Record<string, string[]>;

export type ApiErrorPayload = {
  type: ApiErrorType;
  message: string;
  details: ApiValidationDetails | null;
  code?: string;
};

export type ApiErrorResponse = {
  success?: false;
  status?: 'error';
  error: ApiErrorPayload;
};

export class ApiClientError extends Error {
  override readonly name = 'ApiClientError';

  constructor(
    message: string,
    readonly status: number,
    readonly type: ApiErrorType,
    readonly details: ApiValidationDetails | null = null,
    readonly code?: string,
  ) {
    super(message);
  }
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ApiErrorResponse>;

  const hasSupportedEnvelope =
    candidate.success === false || candidate.status === 'error';

  return (
    hasSupportedEnvelope &&
    !!candidate.error &&
    typeof candidate.error === 'object' &&
    typeof candidate.error.message === 'string'
  );
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
    case 'EmailNotVerified':
    case 'EMAIL_NOT_VERIFIED':
      return 'Debes verificar tu correo electrónico para realizar esta acción.';
    case 'InvalidEmailVerificationToken':
    case 'INVALID_EMAIL_VERIFICATION_TOKEN':
      return 'El enlace de verificación no es válido o expiró.';
    case 'InternalServerError':
      return 'Ocurrio un error del servidor. Intenta nuevamente en unos minutos.';
    default:
      return 'No pudimos completar la accion. Intenta nuevamente.';
  }
}
