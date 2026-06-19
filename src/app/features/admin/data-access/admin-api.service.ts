import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import {
  AdminPaginatedResponse,
  AdminPaginationMeta,
} from '../models/admin-pagination.model';

type ApiParams = Record<string, string | number | boolean | null | undefined>;
type UnknownRecord = Record<string, unknown>;

const emptyMeta: AdminPaginationMeta = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly api = inject(ApiClient);

  getData<T>(path: string, params?: ApiParams): Observable<T> {
    return this.api
      .get<unknown>(`admin/${path}`, { params })
      .pipe(map((response) => unwrapApiData(response) as T));
  }

  getCollection<T>(
    path: string,
    params: ApiParams | undefined,
    mapper: (value: unknown) => T,
    collectionKey: string,
  ): Observable<AdminPaginatedResponse<T>> {
    return this.api.get<unknown>(`admin/${path}`, { params }).pipe(
      map((response) => {
        const values = extractCollection(response, collectionKey);

        return {
          data: values.map((value) => mapper(value)),
          meta: extractMeta(response, values.length),
        };
      }),
    );
  }

  patchData<TResponse, TBody>(path: string, payload: TBody): Observable<TResponse> {
    return this.api
      .patch<unknown, TBody>(`admin/${path}`, payload)
      .pipe(map((response) => unwrapApiData(response) as TResponse));
  }
}

export function unwrapApiData(response: unknown): unknown {
  if (!isRecord(response)) return response;
  return response['data'] ?? response;
}

export function readString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

export function readNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = readString(value);
  return text || null;
}

export function readNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function readNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  return readNumber(value);
}

export function readRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

export function readNullableRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

export function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function extractCollection(response: unknown, collectionKey: string): unknown[] {
  const body = unwrapApiData(response);

  if (Array.isArray(body)) return body;

  if (isRecord(body)) {
    if (Array.isArray(body[collectionKey])) return body[collectionKey];
    if (Array.isArray(body['data'])) return body['data'];
    if (Array.isArray(body['items'])) return body['items'];
  }

  return [];
}

function extractMeta(response: unknown, fallbackTotal: number): AdminPaginationMeta {
  const topLevel = readRecord(response);
  const body = readRecord(unwrapApiData(response));
  const meta = readRecord(topLevel['meta']);
  const bodyMeta = readRecord(body['meta']);
  const source =
    Object.keys(meta).length > 0
      ? meta
      : Object.keys(bodyMeta).length > 0
        ? bodyMeta
        : body;

  return {
    current_page: positiveInteger(source['current_page'], emptyMeta.current_page),
    per_page: positiveInteger(source['per_page'], Math.max(fallbackTotal, emptyMeta.per_page)),
    total: nonNegativeInteger(source['total'], fallbackTotal),
    last_page: positiveInteger(source['last_page'], emptyMeta.last_page),
  };
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Math.trunc(readNumber(value));
  return parsed > 0 ? parsed : fallback;
}

function nonNegativeInteger(value: unknown, fallback: number): number {
  const parsed = Math.trunc(readNumber(value));
  return parsed >= 0 ? parsed : fallback;
}
