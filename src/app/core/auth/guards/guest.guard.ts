import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthRedirectService } from '../services/auth-redirect.service';
import { AuthStore } from '../services/auth.store';

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const authRedirect = inject(AuthRedirectService);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    return true;
  }

  const currentUser = authStore.currentUser();

  if (currentUser) {
    if (!authStore.isEmailVerified()) {
      return router.parseUrl('/auth/email-verification-required');
    }

    return router.parseUrl(authRedirect.getPostLoginRedirect(currentUser));
  }

  return authStore.loadCurrentUser().pipe(
    map((user) => {
      if (!user) {
        return true;
      }

      const verified = user.email_verified === true || !!user.email_verified_at;

      if (!verified) {
        return router.parseUrl('/auth/email-verification-required');
      }

      return router.parseUrl(authRedirect.getPostLoginRedirect(user));
    }),
    catchError(() => {
      return of(true);
    }),
  );
};
