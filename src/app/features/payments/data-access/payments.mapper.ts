import {
  PaginatedPayments,
  Payment,
  PaymentBookingSummary,
  PaymentIntent,
  PaymentIntentStatus,
  PaymentProvider,
  PaymentsPaginationMeta,
  PaymentStatus,
} from './payments.models';

type UnknownRecord = Record<string, unknown>;

const emptyMeta: PaymentsPaginationMeta = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

const intentStatuses: PaymentIntentStatus[] = [
  'pending',
  'processing',
  'succeeded',
  'failed',
  'cancelled',
  'expired',
];

const paymentStatuses: PaymentStatus[] = [
  'succeeded',
  'failed',
  'refunded',
  'partially_refunded',
];

const providers: PaymentProvider[] = ['simulator', 'mercadopago', 'paypal', 'stripe'];

export function unwrapPaymentIntentResponse(response: unknown): PaymentIntent {
  const body = unwrapApiData(response);
  const paymentIntent =
    isRecord(body) && 'payment_intent' in body ? body['payment_intent'] : body;

  return mapPaymentIntent(paymentIntent);
}

export function unwrapPaymentResponse(response: unknown): Payment {
  const body = unwrapApiData(response);
  const payment = isRecord(body) && 'payment' in body ? body['payment'] : body;

  return mapPayment(payment);
}

export function unwrapPaginatedPaymentsResponse(response: unknown): PaginatedPayments {
  const body = unwrapApiData(response);

  if (!isRecord(body)) {
    return { payments: [], meta: emptyMeta };
  }

  const paymentsValue = Array.isArray(body['payments']) ? body['payments'] : [];
  const metaValue = isRecord(body['meta']) ? body['meta'] : {};

  return {
    payments: paymentsValue.map((payment) => mapPayment(payment)),
    meta: mapPaginationMeta(metaValue, paymentsValue.length),
  };
}

export function mapPaymentIntent(value: unknown): PaymentIntent {
  const record = recordOrEmpty(value);

  return {
    id: readString(record['id']),
    booking_id: readString(record['booking_id']),
    client_id: readString(record['client_id']),
    professional_id: readString(record['professional_id']),
    provider: readProvider(record['provider']),
    status: readIntentStatus(record['status']),
    amount: readNumber(record['amount']),
    currency: readString(record['currency']) || 'UYU',
    provider_reference: readNullableString(record['provider_reference']),
    metadata: readNullableRecord(record['metadata']),
    expires_at: readNullableString(record['expires_at']),
    processing_at: readNullableString(record['processing_at']),
    succeeded_at: readNullableString(record['succeeded_at']),
    failed_at: readNullableString(record['failed_at']),
    cancelled_at: readNullableString(record['cancelled_at']),
    failure_reason: readNullableString(record['failure_reason']),
    payment: mapOptionalPayment(record['payment']),
    booking: mapOptionalBookingSummary(record['booking']),
    created_at: readNullableString(record['created_at']),
  };
}

export function mapPayment(value: unknown): Payment {
  const record = recordOrEmpty(value);

  return {
    id: readString(record['id']),
    payment_intent_id: readString(record['payment_intent_id']),
    booking_id: readString(record['booking_id']),
    client_id: readString(record['client_id']),
    professional_id: readString(record['professional_id']),
    provider: readProvider(record['provider']),
    status: readPaymentStatus(record['status']),
    amount: readNumber(record['amount']),
    currency: readString(record['currency']) || 'UYU',
    provider_reference: readNullableString(record['provider_reference']),
    metadata: readNullableRecord(record['metadata']),
    paid_at: readNullableString(record['paid_at']),
    failed_at: readNullableString(record['failed_at']),
    refunded_at: readNullableString(record['refunded_at']),
    failure_reason: readNullableString(record['failure_reason']),
    booking: mapOptionalBookingSummary(record['booking']),
    created_at: readNullableString(record['created_at']),
  };
}

function unwrapApiData(response: unknown): unknown {
  if (!isRecord(response)) return response;

  const data = response['data'];
  if ('success' in response && data !== undefined) return data;

  return response;
}

function mapOptionalPayment(value: unknown): Payment | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;
  return mapPayment(value);
}

function mapOptionalBookingSummary(value: unknown): PaymentBookingSummary | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;

  return {
    id: readString(value['id']),
    status: readString(value['status']),
    starts_at: readNullableString(value['starts_at']),
    ends_at: readNullableString(value['ends_at']),
    service_id: readServiceId(value['service_id']),
  };
}

function mapPaginationMeta(value: UnknownRecord, fallbackTotal: number): PaymentsPaginationMeta {
  return {
    current_page: positiveInteger(value['current_page'], 1),
    per_page: positiveInteger(value['per_page'], Math.max(fallbackTotal, 10)),
    total: positiveInteger(value['total'], fallbackTotal),
    last_page: positiveInteger(value['last_page'], 1),
  };
}

function readProvider(value: unknown): PaymentProvider {
  const text = readString(value);
  return providers.includes(text as PaymentProvider) ? (text as PaymentProvider) : 'simulator';
}

function readIntentStatus(value: unknown): PaymentIntentStatus {
  const text = readString(value);
  return intentStatuses.includes(text as PaymentIntentStatus)
    ? (text as PaymentIntentStatus)
    : 'pending';
}

function readPaymentStatus(value: unknown): PaymentStatus {
  const text = readString(value);
  return paymentStatuses.includes(text as PaymentStatus) ? (text as PaymentStatus) : 'failed';
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

function readNullableRecord(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  return value;
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Math.trunc(readNumber(value));
  return parsed > 0 ? parsed : fallback;
}

function recordOrEmpty(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
