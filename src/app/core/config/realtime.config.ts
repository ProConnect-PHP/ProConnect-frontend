import { InjectionToken } from '@angular/core';

import { environment } from '../../../environments/environment';

export interface RealtimeConfig {
  enabled: boolean;
  key: string;
  wsHost: string;
  wsPort: number;
  wssPort: number;
  forceTLS: boolean;
  authEndpoint: string;
}

export const REALTIME_CONFIG = new InjectionToken<RealtimeConfig>('REALTIME_CONFIG', {
  providedIn: 'root',
  factory: () => environment.realtime,
});
