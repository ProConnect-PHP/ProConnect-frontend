import {
  PaginatedVideoSessions,
  VideoProvider,
  VideoSession,
  VideoSessionBookingSummary,
  VideoSessionJoin,
  VideoSessionParticipant,
  VideoSessionsPaginationMeta,
  VideoSessionStatus,
} from './video-sessions.models';

type UnknownRecord = Record<string, unknown>;

const emptyMeta: VideoSessionsPaginationMeta = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

const statuses: VideoSessionStatus[] = [
  'scheduled',
  'open',
  'in_progress',
  'ended',
  'cancelled',
  'expired',
];

const providers: VideoProvider[] = ['simulator', 'livekit', 'external_url'];

export function unwrapVideoSessionResponse(response: unknown): VideoSession {
  const body = unwrapApiData(response);
  const videoSession =
    isRecord(body) && 'video_session' in body ? body['video_session'] : body;

  return mapVideoSession(videoSession);
}

export function unwrapVideoSessionJoinResponse(response: unknown): VideoSessionJoin {
  const body = unwrapApiData(response);
  const join = isRecord(body) && 'join' in body ? body['join'] : body;

  return mapVideoSessionJoin(join);
}

export function unwrapPaginatedVideoSessionsResponse(response: unknown): PaginatedVideoSessions {
  const body = unwrapApiData(response);

  if (Array.isArray(body)) {
    return {
      video_sessions: body.map((item) => mapVideoSession(item)),
      meta: mapPaginationMeta({}, body.length),
    };
  }

  if (!isRecord(body)) {
    return { video_sessions: [], meta: emptyMeta };
  }

  const sessionsValue = Array.isArray(body['video_sessions']) ? body['video_sessions'] : [];
  const metaValue = isRecord(body['meta']) ? body['meta'] : {};

  return {
    video_sessions: sessionsValue.map((item) => mapVideoSession(item)),
    meta: mapPaginationMeta(metaValue, sessionsValue.length),
  };
}

export function mapVideoSession(value: unknown): VideoSession {
  const record = recordOrEmpty(value);

  return {
    id: readString(record['id']),
    booking_id: readString(record['booking_id']),
    client_id: readString(record['client_id']),
    professional_id: readString(record['professional_id']),
    provider: readProvider(record['provider']),
    status: readStatus(record['status']),
    room_name: readString(record['room_name']),
    join_url: readNullableString(record['join_url']),
    scheduled_start_at: readNullableString(record['scheduled_start_at']),
    scheduled_end_at: readNullableString(record['scheduled_end_at']),
    opened_at: readNullableString(record['opened_at']),
    started_at: readNullableString(record['started_at']),
    ended_at: readNullableString(record['ended_at']),
    cancelled_at: readNullableString(record['cancelled_at']),
    expired_at: readNullableString(record['expired_at']),
    can_join_now: readBoolean(record['can_join_now'], false),
    booking: mapOptionalBookingSummary(record['booking']),
    participants: mapOptionalParticipants(record['participants']),
    created_at: readNullableString(record['created_at']),
  };
}

export function mapVideoSessionJoin(value: unknown): VideoSessionJoin {
  const record = recordOrEmpty(value);

  return {
    video_session_id: readString(record['video_session_id']),
    provider: readProvider(record['provider']),
    room_name: readString(record['room_name']),
    join_url: readNullableString(record['join_url']),
    access_token: readNullableString(record['access_token']),
    participant: mapVideoSessionParticipant(record['participant']),
    expires_at: readNullableString(record['expires_at']),
  };
}

export function mapVideoSessionParticipant(value: unknown): VideoSessionParticipant {
  const record = recordOrEmpty(value);

  return {
    id: readString(record['id']),
    video_session_id: readString(record['video_session_id']),
    user_id: readString(record['user_id']),
    role: readString(record['role']) || 'client',
    provider_identity: readNullableString(record['provider_identity']),
    display_name: readNullableString(record['display_name']),
    first_joined_at: readNullableString(record['first_joined_at']),
    last_joined_at: readNullableString(record['last_joined_at']),
    left_at: readNullableString(record['left_at']),
    join_count: positiveInteger(record['join_count'], 0),
    metadata: readNullableRecord(record['metadata']),
    created_at: readNullableString(record['created_at']),
  };
}

export function createSessionFromJoin(join: VideoSessionJoin): VideoSession {
  return {
    id: join.video_session_id,
    booking_id: '',
    client_id: '',
    professional_id: '',
    provider: join.provider,
    status: 'open',
    room_name: join.room_name,
    join_url: join.join_url,
    scheduled_start_at: null,
    scheduled_end_at: null,
    opened_at: null,
    started_at: null,
    ended_at: null,
    cancelled_at: null,
    expired_at: null,
    can_join_now: true,
    participants: [join.participant],
    created_at: null,
  };
}

function unwrapApiData(response: unknown): unknown {
  if (!isRecord(response)) return response;

  const data = response['data'];
  if (data !== undefined && ('success' in response || isRecord(data))) return data;

  return response;
}

function mapOptionalBookingSummary(value: unknown): VideoSessionBookingSummary | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;

  return {
    id: readString(value['id']),
    status: readString(value['status']),
    starts_at: readNullableString(value['starts_at']),
    ends_at: readNullableString(value['ends_at']),
    service_id: readServiceId(value['service_id']),
    service: mapOptionalService(value['service']),
  };
}

function mapOptionalService(value: unknown) {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;

  return {
    id: readServiceId(value['id']) ?? '',
    name: readString(value['name']) || 'Servicio',
    modality: readNullableString(value['modality']),
  };
}

function mapOptionalParticipants(value: unknown): VideoSessionParticipant[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((item) => mapVideoSessionParticipant(item));
}

function mapPaginationMeta(
  value: UnknownRecord,
  fallbackTotal: number,
): VideoSessionsPaginationMeta {
  return {
    current_page: positiveInteger(value['current_page'], 1),
    per_page: positiveInteger(value['per_page'], Math.max(fallbackTotal, 10)),
    total: positiveInteger(value['total'], fallbackTotal),
    last_page: positiveInteger(value['last_page'], 1),
  };
}

function readProvider(value: unknown): VideoProvider {
  const text = readString(value);
  return providers.includes(text as VideoProvider) ? (text as VideoProvider) : 'simulator';
}

function readStatus(value: unknown): VideoSessionStatus {
  const text = readString(value);
  return statuses.includes(text as VideoSessionStatus) ? (text as VideoSessionStatus) : 'scheduled';
}

function readServiceId(value: unknown): string | number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = readString(value);
  return text || null;
}

function readString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function readNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = readString(value);
  return text || null;
}

function readNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value === 'true' || value === '1';
  return fallback;
}

function readNullableRecord(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  return value;
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Math.trunc(readNumber(value));
  return parsed >= 0 ? parsed : fallback;
}

function recordOrEmpty(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
