import { inject, isDevMode } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthStore } from '../services/auth.store';
import { TokenStorageService } from '../services/token-storage.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authStore = inject(AuthStore);
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);
  const hasSession = tokenStorage.hasSession();
  const isAuthenticated = authStore.isAuthenticated();
  const hasCurrentUser = !!authStore.currentUser();

  if (isDevMode()) {
    console.debug('[AuthGuard]', {
      requestedUrl: state.url,
      hasSession,
      isAuthenticated,
      hasCurrentUser,
      decision: !isAuthenticated
        ? 'redirect-to-login'
        : hasCurrentUser
          ? 'allow'
          : 'hydrate-current-user',
      reason: isAuthenticated ? 'access-token-available' : 'missing-access-token',
    });
  }

  if (!isAuthenticated) return createLoginRedirect(router, state.url);
  if (hasCurrentUser) return true;

  return authStore.loadCurrentUser().pipe(
    map((user) => (user ? true : createLoginRedirect(router, state.url))),
    catchError(() =>
      of(authStore.isAuthenticated() ? true : createLoginRedirect(router, state.url)),
    ),
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
