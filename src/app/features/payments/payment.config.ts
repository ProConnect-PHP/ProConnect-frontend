import { InjectionToken } from '@angular/core';

import { environment } from '../../../environments/environment';

export const PAYMENT_SIMULATOR_ENABLED = new InjectionToken<boolean>(
  'PAYMENT_SIMULATOR_ENABLED',
  {
    providedIn: 'root',
    factory: () => environment.paymentSimulatorEnabled,
  },
);
