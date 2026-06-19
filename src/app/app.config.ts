import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject, isDevMode,
} from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptors
} from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { apiErrorInterceptor } from './core/http/interceptors/api-error.interceptor';

import { AuthWebsocketBridge } from './core/bootstrap/auth-websocket.bridge';
import { catchError, of } from 'rxjs';
import { AuthStore } from './core/auth/services/auth.store';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, apiErrorInterceptor])
    ),
    provideClientHydration(withEventReplay()),

    provideAppInitializer(() => {
      const authStore = inject(AuthStore);
      inject(AuthWebsocketBridge);

      return authStore.loadCurrentUser().pipe(
        catchError(() => of(null)),
      );
    }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ],
};