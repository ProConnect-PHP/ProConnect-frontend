import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import {
  JoinVideoSessionData,
  JoinVideoSessionResponse,
} from '../models/join-video-session-response.model';

type UnknownRecord = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class VideoSessionApiService {
  private readonly api = inject(ApiClient);

  joinBookingVideoSession(bookingId: string): Observable<JoinVideoSessionResponse> {
    return this.api
      .post<unknown, Record<string, never>>(
        `video-sessions/bookings/${bookingId}/join`,
        {},
      )
      .pipe(map(mapJoinVideoSessionResponse));
  }
}

export function mapJoinVideoSessionResponse(response: unknown): JoinVideoSessionResponse {
  const body = unwrapData(response);
  const participant = isRecord(body['participant']) ? body['participant'] : {};

  const data: JoinVideoSessionData = {
    url: readRequiredString(body, ['url', 'join_url'], 'url'),
    token: readRequiredString(body, ['token', 'access_token'], 'token'),
    roomName: readRequiredString(body, ['roomName', 'room_name'], 'roomName'),
    participantIdentity:
      readOptionalString(body, ['participantIdentity', 'participant_identity']) ??
      readOptionalString(participant, ['provider_identity', 'identity']) ??
      '',
    participantName:
      readOptionalString(body, ['participantName', 'participant_name']) ??
      readOptionalString(participant, ['display_name', 'name']) ??
      'Participante',
  };

  return { data };
}

function unwrapData(response: unknown): UnknownRecord {
  if (!isRecord(response)) {
    throw new Error('La respuesta de acceso a LiveKit no tiene el formato esperado.');
  }

  const data = response['data'];
  if (isRecord(data)) {
    const join = data['join'];
    return isRecord(join) ? join : data;
  }

  const join = response['join'];
  return isRecord(join) ? join : response;
}

function readRequiredString(
  record: UnknownRecord,
  keys: string[],
  fieldName: string,
): string {
  const value = readOptionalString(record, keys);
  if (value) return value;

  throw new Error(`La respuesta de acceso a LiveKit no incluye ${fieldName}.`);
}

function readOptionalString(record: UnknownRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }

  return null;
}

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
