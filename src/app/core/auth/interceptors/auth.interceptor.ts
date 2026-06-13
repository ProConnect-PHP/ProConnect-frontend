import { HttpInterceptorFn } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';

import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (
    request.url.includes('auth/login') ||
    request.url.includes('auth/logout') ||
    request.url.includes('password-update') ||
    request.url.includes('password/reset')
  ) {
    return next(request);
  }

  const token = inject(TokenStorageService).getAccessToken();

  if (isDevMode()) {
    console.debug('[AuthInterceptor]', {
      url: request.url,
      hasToken: !!token,
    });
  }

  if (!token || request.headers.has('Authorization')) return next(request);

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
