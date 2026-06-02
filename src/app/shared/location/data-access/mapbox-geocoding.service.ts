import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { MAPBOX_CONFIG } from '../../../core/config/mapbox.config';
import { Coordinates, LocationSuggestion } from '../models/location.models';

type MapboxGeocodingContext = {
  id: string;
  text: string;
};

type MapboxGeocodingFeature = {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
  context?: MapboxGeocodingContext[];
};

type MapboxGeocodingResponse = {
  features: MapboxGeocodingFeature[];
};

@Injectable({ providedIn: 'root' })
export class MapboxGeocodingService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(MAPBOX_CONFIG);

  searchPlaces(query: string): Observable<LocationSuggestion[]> {
    const trimmed = query.trim();

    if (trimmed.length < 3 || this.isTokenMissing()) {
      return of([]);
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json`;

    return this.http
      .get<MapboxGeocodingResponse>(url, {
        params: {
          access_token: this.config.accessToken,
          language: 'es',
          country: 'uy',
          limit: 5,
        },
      })
      .pipe(map((response) => response.features.map((feature) => this.mapFeature(feature))));
  }

  reverseGeocode(coordinates: Coordinates): Observable<LocationSuggestion | null> {
    if (this.isTokenMissing()) {
      return of(null);
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.longitude},${coordinates.latitude}.json`;

    return this.http
      .get<MapboxGeocodingResponse>(url, {
        params: {
          access_token: this.config.accessToken,
          language: 'es',
          country: 'uy',
          limit: 1,
        },
      })
      .pipe(map((response) => response.features[0] ? this.mapFeature(response.features[0]) : null));
  }

  private mapFeature(feature: MapboxGeocodingFeature): LocationSuggestion {
    return {
      id: feature.id,
      label: feature.text,
      placeName: feature.place_name,
      coordinates: {
        longitude: feature.center[0],
        latitude: feature.center[1],
      },
      context: feature.context?.map((item) => item.text) ?? [],
    };
  }

  private isTokenMissing(): boolean {
    return (
      !this.config.accessToken ||
      this.config.accessToken === 'REEMPLAZAR_CON_TOKEN_PUBLICO_MAPBOX' ||
      this.config.accessToken === 'REEMPLAZAR_EN_DEPLOY'
    );
  }
}
