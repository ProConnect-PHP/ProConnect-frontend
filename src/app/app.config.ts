import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
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
      inject(AuthWebsocketBridge);
    }),
  ],
};