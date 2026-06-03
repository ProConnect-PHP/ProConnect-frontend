import {
  PaginatedReviews,
  Review,
  ReviewClient,
  ReviewReply,
  ReviewReplyProfessional,
  ReviewsPaginationMeta,
} from './reviews.models';

type UnknownRecord = Record<string, unknown>;

const emptyMeta: ReviewsPaginationMeta = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

export function unwrapReviewResponse(response: unknown): Review {
  const body = unwrapApiData(response);
  const review = isRecord(body) && 'review' in body ? body['review'] : body;
  return mapReview(review);
}

export function unwrapReviewReplyResponse(response: unknown): ReviewReply {
  const body = unwrapApiData(response);
  const reply = isRecord(body) && 'reply' in body ? body['reply'] : body;
  return mapReviewReply(reply);
}

export function unwrapPaginatedReviewsResponse(response: unknown): PaginatedReviews {
  const body = unwrapApiData(response);

  if (!isRecord(body)) {
    return { reviews: [], meta: emptyMeta };
  }

  const reviewsValue = Array.isArray(body['reviews']) ? body['reviews'] : [];
  const metaValue = isRecord(body['meta']) ? body['meta'] : {};

  return {
    reviews: reviewsValue.map((review) => mapReview(review)),
    meta: mapPaginationMeta(metaValue, reviewsValue.length),
  };
}

export function mapReview(value: unknown): Review {
  const record = recordOrEmpty(value);

  return {
    id: readString(record['id']),
    booking_id: readString(record['booking_id']),
    service_id: readServiceId(record['service_id']),
    professional_id: readString(record['professional_id']),
    rating: clampRating(readNumber(record['rating'])),
    comment: readNullableString(record['comment']),
    comment_deleted_at: readNullableString(record['comment_deleted_at']),
    edited_at: readNullableString(record['edited_at']),
    client: mapOptionalReviewClient(record['client']),
    reply: mapOptionalReviewReply(record['reply']),
    created_at: readNullableString(record['created_at']),
  };
}

export function mapReviewReply(value: unknown): ReviewReply {
  const record = recordOrEmpty(value);

  return {
    id: readString(record['id']),
    body: readString(record['body']),
    edited_at: readNullableString(record['edited_at']),
    professional: mapOptionalReplyProfessional(record['professional']),
    created_at: readNullableString(record['created_at']),
  };
}

function unwrapApiData(response: unknown): unknown {
  if (!isRecord(response)) return response;

  const data = response['data'];
  if ('success' in response && data !== undefined) return data;

  return response;
}

function mapOptionalReviewClient(value: unknown): ReviewClient | undefined {
  if (!isRecord(value)) return undefined;

  return {
    id: readString(value['id']),
    name: readString(value['name']) || 'Cliente de ProConnect',
    avatar_url: readNullableString(value['avatar_url']),
  };
}

function mapOptionalReviewReply(value: unknown): ReviewReply | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;
  return mapReviewReply(value);
}

function mapOptionalReplyProfessional(value: unknown): ReviewReplyProfessional | undefined {
  if (!isRecord(value)) return undefined;

  const user = isRecord(value['user']) ? value['user'] : {};

  return {
    id: readString(value['id']),
    user: {
      id: readString(user['id']),
      name: readString(user['name']) || 'Profesional de ProConnect',
      avatar_url: readNullableString(user['avatar_url']),
    },
  };
}

function mapPaginationMeta(value: UnknownRecord, fallbackTotal: number): ReviewsPaginationMeta {
  return {
    current_page: positiveInteger(value['current_page'], 1),
    per_page: positiveInteger(value['per_page'], Math.max(fallbackTotal, 10)),
    total: positiveInteger(value['total'], fallbackTotal),
    last_page: positiveInteger(value['last_page'], 1),
  };
}

function readServiceId(value: unknown): string | number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return readString(value);
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

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Math.trunc(readNumber(value));
  return parsed > 0 ? parsed : fallback;
}

function clampRating(value: number): number {
  if (value < 0) return 0;
  if (value > 5) return 5;
  return value;
}

function recordOrEmpty(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
