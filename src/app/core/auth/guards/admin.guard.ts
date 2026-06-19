import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { ApiClientError } from '../../http/models/api-error.model';
import { AuthStore } from '../services/auth.store';

export const adminGuard: CanActivateFn = (_route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    return createLoginRedirect(router, state.url);
  }

  const currentUser = authStore.currentUser();

  if (currentUser) {
    return currentUser.role === 'admin' ? true : router.createUrlTree(['/']);
  }

  return authStore.loadCurrentUser().pipe(
    map((user) => {
      if (!user) {
        return createLoginRedirect(router, state.url);
      }

      return user.role === 'admin' ? true : router.createUrlTree(['/']);
    }),
    catchError((error: unknown) => {
      if (error instanceof ApiClientError && error.status === 401) {
        return of(createLoginRedirect(router, state.url));
      }

      return of(router.createUrlTree(['/']));
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
