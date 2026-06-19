import {
  AppNotification,
  NotificationPaginationLinks,
  NotificationPaginationMeta,
  PaginatedNotificationsResponse,
} from '../models/notification.models';

type UnknownRecord = Record<string, unknown>;

const emptyLinks: NotificationPaginationLinks = {
  first: null,
  last: null,
  prev: null,
  next: null,
};

export function mapNotification(value: unknown): AppNotification | null {
  const record = recordOrNull(value);
  if (!record) return null;

  const id = readString(record['id']);
  if (!id) return null;

  const readAt = readNullableString(record['read_at']);
  const archivedAt = readNullableString(record['archived_at']);
  const createdAt = readString(record['created_at']);
  const createdDate = readString(record['created_date']);
  const createdTime = readString(record['created_time']);

  return {
    id,
    type: readString(record['type']) || 'notification',
    title: readString(record['title']) || 'Notificacion',
    message: readString(record['message']),
    action_route: readNullableString(record['action_route']),
    metadata: readRecord(record['metadata']),
    is_read: readBoolean(record['is_read'], readAt !== null),
    is_archived: readBoolean(record['is_archived'], archivedAt !== null),
    read_at: readAt,
    archived_at: archivedAt,
    created_at: createdAt || buildCreatedAtFallback(createdDate, createdTime),
    created_date: createdDate,
    created_time: createdTime,
  };
}

export function unwrapNotificationResponse(response: unknown): AppNotification {
  const body = unwrapDataObject(response);
  const notification = mapNotification(body);

  if (!notification) {
    throw new Error('La respuesta de notificacion no tiene un identificador valido.');
  }

  return notification;
}

export function unwrapPaginatedNotificationsResponse(
  response: unknown,
): PaginatedNotificationsResponse {
  const body = findPaginationBody(response);
  const rawItems = Array.isArray(body['data']) ? body['data'] : [];
  const data = rawItems
    .map((item) => mapNotification(item))
    .filter((item): item is AppNotification => item !== null);
  const rawMeta = recordOrEmpty(body['meta']);
  const legacyMeta = Object.keys(rawMeta).length > 0 ? rawMeta : body;

  return {
    data,
    links: mapLinks(recordOrEmpty(body['links'])),
    meta: mapMeta(legacyMeta, data.length),
  };
}

function findPaginationBody(response: unknown): UnknownRecord {
  const root = recordOrEmpty(response);
  if (Array.isArray(root['data'])) return root;

  const nested = recordOrEmpty(root['data']);
  if (Array.isArray(nested['data'])) return nested;

  return {
    data: Array.isArray(response) ? response : [],
  };
}

function unwrapDataObject(response: unknown): unknown {
  const record = recordOrNull(response);
  if (!record) return response;
  return record['data'] ?? response;
}

function mapLinks(value: UnknownRecord): NotificationPaginationLinks {
  return {
    first: readNullableString(value['first']),
    last: readNullableString(value['last']),
    prev: readNullableString(value['prev']),
    next: readNullableString(value['next']),
  };
}

function mapMeta(value: UnknownRecord, fallbackTotal: number): NotificationPaginationMeta {
  const currentPage = positiveInteger(value['current_page'], 1);
  const perPage = positiveInteger(value['per_page'], Math.max(fallbackTotal, 20));
  const total = nonNegativeInteger(value['total'], fallbackTotal);

  return {
    current_page: currentPage,
    from: nullableNonNegativeInteger(value['from']),
    last_page: positiveInteger(value['last_page'], 1),
    path: readString(value['path']),
    per_page: perPage,
    to: nullableNonNegativeInteger(value['to']),
    total,
  };
}

function buildCreatedAtFallback(date: string, time: string): string {
  if (!date) return new Date(0).toISOString();
  return `${date}T${time || '00:00'}:00`;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
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

function readRecord(value: unknown): Record<string, unknown> {
  return recordOrNull(value) ?? {};
}

function readNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Math.trunc(readNumber(value));
  return parsed > 0 ? parsed : fallback;
}

function nonNegativeInteger(value: unknown, fallback: number): number {
  const parsed = Math.trunc(readNumber(value));
  return parsed >= 0 ? parsed : fallback;
}

function nullableNonNegativeInteger(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return nonNegativeInteger(value, 0);
}

function recordOrEmpty(value: unknown): UnknownRecord {
  return recordOrNull(value) ?? {};
}

function recordOrNull(value: unknown): UnknownRecord | null {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}
