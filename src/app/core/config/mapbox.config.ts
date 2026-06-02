import { InjectionToken } from '@angular/core';

import { environment } from '../../../environments/environment';

export type MapboxConfig = {
  accessToken: string;
  defaultCenter: {
    latitude: number;
    longitude: number;
  };
  defaultZoom: number;
};

export const MAPBOX_CONFIG = new InjectionToken<MapboxConfig>('MAPBOX_CONFIG', {
  providedIn: 'root',
  factory: () => environment.mapbox,
});
