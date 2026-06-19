import { inject, isDevMode } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { ApiClientError } from '../../http/models/api-error.model';
import { AuthStore } from '../services/auth.store';

export const emailVerifiedGuard: CanActivateFn = (_route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const isAuthenticated = authStore.isAuthenticated();
  const currentUser = authStore.currentUser();

  if (isDevMode()) {
    console.debug('[EmailVerifiedGuard]', {
      requestedUrl: state.url,
      isAuthenticated,
      hasCurrentUser: !!currentUser,
      isEmailVerified: authStore.isEmailVerified(),
    });
  }

  if (!isAuthenticated) {
    return createLoginRedirect(router, state.url);
  }

  if (currentUser) {
    return authStore.isEmailVerified()
      ? true
      : createEmailVerificationRedirect(router, state.url);
  }

  return authStore.loadCurrentUser().pipe(
    map((user) => {
      if (!user) {
        return createLoginRedirect(router, state.url);
      }

      const verified = user.email_verified === true || !!user.email_verified_at;

      return verified ? true : createEmailVerificationRedirect(router, state.url);
    }),
    catchError((error: unknown) => {
      if (error instanceof ApiClientError && error.status === 401) {
        return of(createLoginRedirect(router, state.url));
      }

      return of(createEmailVerificationRedirect(router, state.url));
    }),
  );
};

function createLoginRedirect(router: Router, requestedUrl: string) {
  return router.createUrlTree(['/login'], {
    queryParams: {
      returnUrl: requestedUrl,
      redirectTo: requestedUrl,
    },
  });
}

function createEmailVerificationRedirect(router: Router, requestedUrl: string) {
  return router.createUrlTree(['/auth/email-verification-required'], {
    queryParams: {
      returnUrl: requestedUrl,
    },
  });
}
