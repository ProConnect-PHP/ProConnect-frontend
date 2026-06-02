import type { LngLatBoundsLike, LngLatLike } from 'mapbox-gl';

import { Coordinates } from '../models/location.models';

export const uruguayBounds: LngLatBoundsLike = [
  [-58.7, -35.1],
  [-53.0, -30.0],
];

export function toLngLat(coordinates: Coordinates): LngLatLike {
  return [coordinates.longitude, coordinates.latitude];
}

export function fromLngLat(lngLat: { lat: number; lng: number }): Coordinates {
  return {
    latitude: lngLat.lat,
    longitude: lngLat.lng,
  };
}
