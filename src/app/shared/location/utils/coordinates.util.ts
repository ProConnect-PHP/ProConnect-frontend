import { Coordinates } from '../models/location.models';

const URUGUAY_BOUNDS = {
  south: -35.1,
  north: -30.0,
  west: -58.7,
  east: -53.0,
} as const;

export function isValidCoordinates(coordinates: Coordinates): boolean {
  return (
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude) &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
}

export function isInsideUruguay(coordinates: Coordinates): boolean {
  return (
    coordinates.latitude >= URUGUAY_BOUNDS.south &&
    coordinates.latitude <= URUGUAY_BOUNDS.north &&
    coordinates.longitude >= URUGUAY_BOUNDS.west &&
    coordinates.longitude <= URUGUAY_BOUNDS.east
  );
}

export function clampToUruguay(coordinates: Coordinates): Coordinates {
  return {
    latitude: clamp(coordinates.latitude, URUGUAY_BOUNDS.south, URUGUAY_BOUNDS.north),
    longitude: clamp(coordinates.longitude, URUGUAY_BOUNDS.west, URUGUAY_BOUNDS.east),
  };
}

export function coordinatesLabel(coordinates: Coordinates): string {
  return `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
