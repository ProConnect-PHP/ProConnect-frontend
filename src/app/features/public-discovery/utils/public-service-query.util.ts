import { ParamMap } from '@angular/router';

import {
  PublicServiceDuration,
  PublicServiceModality,
  PublicServiceSort,
  PublicServicesQuery,
} from '../models/public-discovery.models';

export const publicServiceDurations: PublicServiceDuration[] = [15, 30, 45, 60, 90, 120];

export const publicServiceSorts: PublicServiceSort[] = [
  'recent',
  'price_asc',
  'price_desc',
  'duration_asc',
  'duration_desc',
  'rating_desc',
];

export const publicServiceModalities: PublicServiceModality[] = [
  'presencial',
  'remota',
  'hibrida',
];

export function cleanPublicServicesQuery(
  query: PublicServicesQuery,
): Record<string, string | number | boolean> {
  const cleaned: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === '') continue;
    cleaned[key] = value;
  }

  return cleaned;
}

export function publicServicesQueryFromParams(params: ParamMap): PublicServicesQuery {
  return {
    search: stringParam(params, 'search'),
    modality: modalityParam(params, 'modality'),
    min_price: numberParam(params, 'min_price'),
    max_price: numberParam(params, 'max_price'),
    duration_minutes: durationParam(params, 'duration_minutes'),
    available_date: stringParam(params, 'available_date'),
    latitude: numberParam(params, 'latitude'),
    longitude: numberParam(params, 'longitude'),
    radius_km: numberParam(params, 'radius_km'),
    per_page: positiveIntegerParam(params, 'per_page') ?? 12,
    page: positiveIntegerParam(params, 'page') ?? 1,
    sort: sortParam(params, 'sort') ?? 'recent',
  };
}

export function validatePublicServicesQuery(query: PublicServicesQuery): string | null {
  if (query.min_price !== null && query.min_price !== undefined && query.min_price < 0) {
    return 'El precio minimo no puede ser negativo.';
  }

  if (query.max_price !== null && query.max_price !== undefined && query.max_price < 0) {
    return 'El precio maximo no puede ser negativo.';
  }

  if (
    query.min_price !== null &&
    query.min_price !== undefined &&
    query.max_price !== null &&
    query.max_price !== undefined &&
    query.max_price < query.min_price
  ) {
    return 'El precio maximo debe ser mayor o igual al minimo.';
  }

  if (query.latitude !== null && query.latitude !== undefined && !isInRange(query.latitude, -90, 90)) {
    return 'La latitud debe estar entre -90 y 90.';
  }

  if (
    query.longitude !== null &&
    query.longitude !== undefined &&
    !isInRange(query.longitude, -180, 180)
  ) {
    return 'La longitud debe estar entre -180 y 180.';
  }

  if (
    query.radius_km !== null &&
    query.radius_km !== undefined &&
    !isInRange(query.radius_km, 1, 500)
  ) {
    return 'El radio debe estar entre 1 y 500 km.';
  }

  const geoValues = [query.latitude, query.longitude, query.radius_km];
  const hasAnyGeoValue = geoValues.some((value) => value !== null && value !== undefined);
  const hasEveryGeoValue = geoValues.every((value) => value !== null && value !== undefined);

  if (hasAnyGeoValue && !hasEveryGeoValue) {
    return 'Para buscar por ubicacion completa latitud, longitud y radio.';
  }

  return null;
}

function stringParam(params: ParamMap, key: string): string | null {
  const value = params.get(key);
  return value && value.trim().length > 0 ? value.trim() : null;
}

function numberParam(params: ParamMap, key: string): number | null {
  const value = params.get(key);
  if (value === null || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function positiveIntegerParam(params: ParamMap, key: string): number | null {
  const value = numberParam(params, key);
  if (value === null || !Number.isInteger(value) || value < 1) return null;
  return value;
}

function durationParam(params: ParamMap, key: string): PublicServiceDuration | null {
  const value = numberParam(params, key);
  if (value === null) return null;
  return publicServiceDurations.includes(value as PublicServiceDuration)
    ? (value as PublicServiceDuration)
    : null;
}

function modalityParam(params: ParamMap, key: string): PublicServiceModality | null {
  const value = params.get(key);
  if (!value) return null;
  return publicServiceModalities.includes(value as PublicServiceModality)
    ? (value as PublicServiceModality)
    : null;
}

function sortParam(params: ParamMap, key: string): PublicServiceSort | null {
  const value = params.get(key);
  if (!value) return null;
  return publicServiceSorts.includes(value as PublicServiceSort) ? (value as PublicServiceSort) : null;
}

function isInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}
