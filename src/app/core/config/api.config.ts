import { InjectionToken } from '@angular/core';

import { environment } from '../../../environments/environment';

export type ApiConfig = {
  baseUrl: string;
};

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    baseUrl: environment.apiBaseUrl,
  }),
});
