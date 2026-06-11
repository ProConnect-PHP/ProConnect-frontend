import { HttpInterceptorFn } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';

import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
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
