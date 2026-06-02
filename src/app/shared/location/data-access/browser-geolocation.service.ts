import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Coordinates } from '../models/location.models';

@Injectable({ providedIn: 'root' })
export class BrowserGeolocationService {
  getCurrentPosition(): Observable<Coordinates> {
    return new Observable<Coordinates>((observer) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        observer.error(new Error('Tu navegador no soporta geolocalizacion.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          observer.complete();
        },
        () => {
          observer.error(new Error('No pudimos obtener tu ubicacion actual.'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    });
  }
}
