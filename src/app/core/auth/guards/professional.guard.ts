import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { ApiClientError } from '../../http/models/api-error.model';
import { AuthStore } from '../services/auth.store';
import { hasProfessionalAccess } from '../utils/auth-capabilities';

export const professionalGuard: CanActivateFn = (_route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    return createLoginRedirect(router, state.url);
  }

  const currentUser = authStore.currentUser();
  if (currentUser) {
    return hasProfessionalAccess(currentUser)
      ? true
      : createOnboardingRedirect(router, state.url);
  }

  return authStore.loadCurrentUser().pipe(
    map((user) =>
      hasProfessionalAccess(user) ? true : createOnboardingRedirect(router, state.url),
    ),
    catchError((error: unknown) =>
      of(
        error instanceof ApiClientError && error.status === 401
          ? createLoginRedirect(router, state.url)
          : createOnboardingRedirect(router, state.url),
      ),
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

function createOnboardingRedirect(router: Router, requestedUrl: string) {
  return router.createUrlTree(['/professional/onboarding'], {
    queryParams: {
      returnUrl: requestedUrl,
    },
  });
}
