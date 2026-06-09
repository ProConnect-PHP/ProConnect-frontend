import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthStore } from '../services/auth.store';

export const professionalGuard: CanActivateFn = (_route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const currentUser = authStore.currentUser();
  if (currentUser) {
    return currentUser.role === 'professional'
      ? true
      : router.createUrlTree(['/my-bookings']);
  }

  return authStore.loadCurrentUser().pipe(
    map((user) =>
      user?.role === 'professional' ? true : router.createUrlTree(['/my-bookings']),
    ),
    catchError(() =>
      of(
        router.createUrlTree(['/login'], {
          queryParams: {
            returnUrl: state.url,
            redirectTo: state.url,
          },
        }),
      ),
    ),
  );
};
