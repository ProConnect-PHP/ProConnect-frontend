import {
  PaginatedPayments,
  PayableType,
  Payment,
  PaymentBookingSummary,
  PaymentIntent,
  PaymentIntentStatus,
  PaymentPackageSummary,
  PaymentPartySummary,
  PaymentProvider,
  PaymentsPaginationMeta,
  PaymentStatus,
  PaymentStatusResult,
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
  'checkout_created',
  'processing',
  'succeeded',
  'failed',
  'cancelled',
  'expired',
];

const paymentStatuses: PaymentStatus[] = [
  'pending',
  'approved',
  'rejected',
  'cancelled',
  'succeeded',
  'failed',
  'refunded',
  'partially_refunded',
];

const providers: PaymentProvider[] = ['simulator', 'mercadopago', 'paypal'];

export function unwrapPaymentIntentResponse(response: unknown): PaymentIntent {
  const body = unwrapApiData(response);
  const paymentIntent =
    isRecord(body) && 'payment_intent' in body
      ? body['payment_intent']
      : isRecord(body) && 'paymentIntent' in body
        ? body['paymentIntent']
        : body;

  return mapPaymentIntent(paymentIntent);
}

export function unwrapPaymentResponse(response: unknown): Payment {
  const body = unwrapApiData(response);
  const payment = isRecord(body) && 'payment' in body ? body['payment'] : body;

  return mapPayment(payment);
}

export function unwrapPaymentStatusResponse(response: unknown): PaymentStatusResult {
  const body = unwrapApiData(response);
  const record = recordOrEmpty(body);
  const paymentIntentValue =
    record['payment_intent'] ?? record['paymentIntent'] ?? record['intent'] ?? body;
  const paymentValue = record['payment'];
  const paymentIntent = mapPaymentIntent(paymentIntentValue);
  const payment =
    paymentValue === null || paymentValue === undefined
      ? paymentIntent.payment ?? null
      : mapPayment(paymentValue);

  return {
    payment_intent: paymentIntent,
    payment,
  };
}

export function unwrapPaginatedPaymentsResponse(response: unknown): PaginatedPayments {
  const body = unwrapApiData(response);

  if (Array.isArray(body)) {
    return {
      payments: body.map((payment) => mapPayment(payment)),
      meta: mapPaginationMeta({}, body.length),
    };
  }

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
  const payableType = readPayableType(record);
  const payableId = readPayableId(record, payableType);

  return {
    id: readString(record['id']),
    payable_type: payableType,
    payable_id: payableId,
    booking_id:
      readNullableString(record['booking_id']) ?? (payableType === 'booking' ? payableId : null),
    package_product_id:
      readNullableString(record['package_product_id']) ??
      (payableType === 'package' ? payableId : null),
    client_id: readNullableString(record['client_id']),
    professional_id: readNullableString(record['professional_id']),
    provider: readProvider(record['provider']),
    status: readIntentStatus(record['status']),
    amount: readNumber(record['amount']),
    currency: readString(record['currency']) || 'UYU',
    checkout_url: readNullableString(record['checkout_url']),
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
    package_product: mapOptionalPackageSummary(record['package_product']),
    created_at: readNullableString(record['created_at']),
    updated_at: readNullableString(record['updated_at']),
  };
}

export function mapPayment(value: unknown): Payment {
  const record = recordOrEmpty(value);

  return {
    id: readString(record['id']),
    payment_intent_id: readString(record['payment_intent_id']),
    booking_id: readNullableString(record['booking_id']),
    package_product_id: readNullableString(record['package_product_id']),
    client_package_id: readNullableString(record['client_package_id']),
    client_id: readNullableString(record['client_id']),
    professional_id: readNullableString(record['professional_id']),
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
    package_product: mapOptionalPackageSummary(record['package_product']),
    client_package: mapOptionalPackageSummary(record['client_package']),
    client: mapOptionalPartySummary(record['client']),
    created_at: readNullableString(record['created_at']),
    updated_at: readNullableString(record['updated_at']),
  };
}

function unwrapApiData(response: unknown): unknown {
  if (!isRecord(response)) return response;
  return response['data'] ?? response;
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
    service: mapOptionalService(value['service']),
  };
}

function mapOptionalService(
  value: unknown,
): { id: string | number; name: string } | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;

  return {
    id: readServiceId(value['id']) ?? '',
    name: readString(value['name']) || 'Servicio',
  };
}

function mapOptionalPackageSummary(value: unknown): PaymentPackageSummary | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;

  return {
    id: readString(value['id']),
    name: readString(value['name']) || 'Paquete',
  };
}

function mapOptionalPartySummary(value: unknown): PaymentPartySummary | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;

  return {
    id: readString(value['id']),
    name: readString(value['name']) || 'Cliente',
  };
}

function mapPaginationMeta(value: UnknownRecord, fallbackTotal: number): PaymentsPaginationMeta {
  return {
    current_page: positiveInteger(value['current_page'], 1),
    per_page: positiveInteger(value['per_page'], Math.max(fallbackTotal, 10)),
    total: nonNegativeInteger(value['total'], fallbackTotal),
    last_page: positiveInteger(value['last_page'], 1),
  };
}

function readPayableType(record: UnknownRecord): PayableType {
  const value = readString(record['payable_type']);
  if (value === 'package') return 'package';
  if (value === 'booking') return 'booking';
  return readString(record['package_product_id']) ? 'package' : 'booking';
}

function readPayableId(record: UnknownRecord, payableType: PayableType): string {
  return (
    readString(record['payable_id']) ||
    (payableType === 'package'
      ? readString(record['package_product_id'])
      : readString(record['booking_id']))
  );
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
  return paymentStatuses.includes(text as PaymentStatus) ? (text as PaymentStatus) : 'pending';
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

function nonNegativeInteger(value: unknown, fallback: number): number {
  const parsed = Math.trunc(readNumber(value));
  return parsed >= 0 ? parsed : fallback;
}

function recordOrEmpty(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
