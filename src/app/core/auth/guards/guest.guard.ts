import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthRedirectService } from '../services/auth-redirect.service';
import { AuthStore } from '../services/auth.store';

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const authRedirect = inject(AuthRedirectService);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) return true;

  const currentUser = authStore.currentUser();
  if (currentUser) {
    return router.parseUrl(authRedirect.getPostLoginRedirect(currentUser));
  }

  return authStore.loadCurrentUser().pipe(
    map((user) =>
      user ? router.parseUrl(authRedirect.getPostLoginRedirect(user)) : true,
    ),
    catchError(() =>
      of(authStore.isAuthenticated() ? router.createUrlTree(['/my-bookings']) : true),
    ),
  );
};
