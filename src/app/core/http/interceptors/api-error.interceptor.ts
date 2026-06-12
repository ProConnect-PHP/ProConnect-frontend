import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, switchMap, tap, throwError } from 'rxjs';

import { TokenStorageService } from '../../auth/services/token-storage.service';
import { RefreshTokenRequest, RefreshTokenResponse } from '../../auth/models/auth.models';
import { API_CONFIG } from '../../config/api.config';
import {
  ApiClientError,
  ApiErrorPayload,
  getFriendlyApiMessage,
  isApiErrorResponse,
} from '../models/api-error.model';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);
  const backend = inject(HttpBackend);
  const apiConfig = inject(API_CONFIG);
  const rawHttp = new HttpClient(backend);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (isUnauthorized(error) && canRefresh(request.url, tokenStorage)) {
        return refreshAndRetry(request, rawHttp, tokenStorage, apiConfig.baseUrl, next).pipe(
          catchError((refreshError: unknown) => {
            tokenStorage.clear();
            void router.navigateByUrl('/login');
            return throwError(() => toClientError(refreshError));
          }),
        );
      }

      const clientError = toClientError(error);

      if (shouldRedirectToLogin(request.url, clientError.status)) {
        tokenStorage.clear();
        void router.navigateByUrl('/login');
      }

      return throwError(() => clientError);
    }),
  );
};

function refreshAndRetry(
  request: HttpRequest<unknown>,
  rawHttp: HttpClient,
  tokenStorage: TokenStorageService,
  baseUrl: string,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    return throwError(() => new Error('Missing refresh token.'));
  }

  const payload: RefreshTokenRequest = { refresh_token: refreshToken };
  const url = `${baseUrl.replace(/\/+$/, '')}/auth/refresh`;

  return rawHttp.post<RefreshTokenResponse>(url, payload).pipe(
    tap((response) => tokenStorage.setTokens(response.access_token, response.refresh_token)),
    switchMap((response) =>
      next(
        request.clone({
          setHeaders: {
            Authorization: `Bearer ${response.access_token}`,
          },
        }),
      ),
    ),
  );
}

function canRefresh(url: string, tokenStorage: TokenStorageService): boolean {
  return !isAuthEndpoint(url) && !!tokenStorage.getRefreshToken();
}

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/oauth/exchange') ||
    url.includes('/auth/oauth/')
  );
}

function shouldRedirectToLogin(url: string, status: number): boolean {
  return status === 401 && !isAuthEndpoint(url);
}

function isUnauthorized(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 401;
}

function toClientError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (error instanceof HttpErrorResponse) {
    const payload = extractPayload(error);
    const type = payload?.type ?? httpStatusToType(error.status);
    const message =
      payload?.message?.trim() ||
      getFriendlyApiMessage(type, error.message);

    return new ApiClientError(message, error.status, type, payload?.details ?? null);
  }

  if (error instanceof Error) {
    return new ApiClientError(error.message, 0, 'HttpError');
  }

  return new ApiClientError('No pudimos completar la accion. Intenta nuevamente.', 0, 'HttpError');
}

function extractPayload(error: HttpErrorResponse): ApiErrorPayload | null {
  if (isApiErrorResponse(error.error)) {
    return error.error.error;
  }

  if (isLaravelValidationResponse(error.error)) {
    return {
      type: 'ValidationError',
      message: error.error.message,
      details: error.error.errors,
    };
  }

  return null;
}

function isLaravelValidationResponse(
  value: unknown,
): value is { message: string; errors: Record<string, string[]> } {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as {
    message?: unknown;
    errors?: unknown;
  };

  if (typeof candidate.message !== 'string' || !candidate.errors) {
    return false;
  }

  if (typeof candidate.errors !== 'object' || Array.isArray(candidate.errors)) {
    return false;
  }

  return Object.values(candidate.errors).every(
    (messages) =>
      Array.isArray(messages) && messages.every((message) => typeof message === 'string'),
  );
}

function httpStatusToType(status: number): string {
  switch (status) {
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'NotFound';
    case 422:
      return 'ValidationError';
    case 429:
      return 'TooManyRequests';
    case 500:
      return 'InternalServerError';
    default:
      return 'HttpError';
  }
}
