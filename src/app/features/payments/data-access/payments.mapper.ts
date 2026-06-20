import {
  PaginatedPayments,
  PayableType,
  Payment,
  PaymentBookingSummary,
  PaymentDetail,
  PaymentHistoryItem,
  PaymentHistorySource,
  PaymentIntent,
  PaymentIntentStatus,
  PaymentMovement,
  PaymentMovementBooking,
  PaymentMovementKind,
  PaymentMovementStatus,
  PaymentMovementsResponse,
  PaymentPackageProductSummary,
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
  'pending_capture',
  'paid',
  'succeeded',
  'completed',
  'failed',
  'rejected',
  'denied',
  'cancelled',
  'expired',
  'unknown',
];

const paymentStatuses: PaymentStatus[] = [
  'pending',
  'processing',
  'paid',
  'approved',
  'rejected',
  'cancelled',
  'succeeded',
  'completed',
  'failed',
  'rejected',
  'denied',
  'expired',
  'refunded',
  'partially_refunded',
  'unknown',
];

const movementStatuses: PaymentMovementStatus[] = [
  'paid',
  'succeeded',
  'completed',
  'pending',
  'checkout_created',
  'processing',
  'pending_capture',
  'failed',
  'denied',
  'cancelled',
  'expired',
  'refunded',
  'unknown',
];

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

export function unwrapMyPaymentsResponse(response: unknown): PaymentHistoryItem[] {
  const body = unwrapApiData(response);

  if (Array.isArray(body)) return body.map((item) => mapPaymentHistoryItem(item));
  if (!isRecord(body)) return [];

  const values = Array.isArray(body['data'])
    ? body['data']
    : Array.isArray(body['payments'])
      ? body['payments']
      : [];

  return values.map((item) => mapPaymentHistoryItem(item));
}

export function unwrapPaymentDetailResponse(response: unknown): PaymentDetail {
  const body = unwrapApiData(response);
  const record = recordOrEmpty(body);
  const source = readPaymentHistorySource(record);
  const operationValue =
    record['operation'] ??
    record['history_item'] ??
    (source === 'payment'
      ? record['payment'] ?? body
      : record['payment_intent'] ?? record['paymentIntent'] ?? record['intent'] ?? body);
  const operation = mapPaymentHistoryItem(operationValue, source);
  const relatedAttempts = Array.isArray(record['related_attempts'])
    ? record['related_attempts'].map((attempt) => mapPaymentIntent(attempt))
    : [];

  return {
    source: operation.source,
    operation,
    payment:
      operation.source === 'payment'
        ? mapPayment(operationValue)
        : mapOptionalPayment(record['payment']) ?? null,
    payment_intent:
      operation.source === 'payment_intent'
        ? mapPaymentIntent(operationValue)
        : mapOptionalPaymentIntent(record['payment_intent'] ?? record['paymentIntent']) ?? null,
    booking:
      mapOptionalBookingSummary(record['booking']) ?? operation.booking ?? null,
    package_product:
      mapOptionalPackageProductSummary(record['package_product']) ??
      mapHistoryPackageProduct(operation.package_product) ??
      null,
    successful_intent: mapOptionalPaymentIntent(record['successful_intent']) ?? null,
    related_attempts: relatedAttempts,
  };
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
    next_poll_after_seconds: readNullablePositiveInteger(record['next_poll_after_seconds']),
  };
}

/**
 * Accepts both the unified contract and the previous `Payment`-only contract.
 * This lets the client deploy independently from the API migration.
 */
export function unwrapPaymentMovementsResponse(response: unknown): PaymentMovementsResponse {
  const body = unwrapApiData(response);

  if (Array.isArray(body)) {
    const payments = dedupeSuccessfulIntentMovements(body.map((item) => mapPaymentMovement(item)));
    return { payments, meta: mapPaginationMeta({}, payments.length) };
  }

  if (!isRecord(body)) return { payments: [], meta: emptyMeta };

  const values = Array.isArray(body['payments'])
    ? body['payments']
    : Array.isArray(body['data'])
      ? body['data']
      : [];
  const movements = dedupeSuccessfulIntentMovements(values.map((item) => mapPaymentMovement(item)));
  const metaValue = isRecord(body['meta']) ? body['meta'] : {};

  return {
    payments: movements,
    meta: mapPaginationMeta(metaValue, movements.length),
  };
}

/** Maps a status endpoint response (new or old) to a single unified movement. */
export function unwrapPaymentMovementResponse(response: unknown): PaymentMovement {
  const body = unwrapApiData(response);
  const record = recordOrEmpty(body);
  const value = record['payment_intent'] ?? record['paymentIntent'] ?? record['intent'] ?? body;
  return mapPaymentMovement(value);
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
    can_retry: readOptionalBoolean(record['can_retry']),
    can_continue_checkout: readOptionalBoolean(record['can_continue_checkout']),
    can_refresh_status: readOptionalBoolean(record['can_refresh_status']),
    can_view_booking: readOptionalBoolean(record['can_view_booking']),
    next_poll_after_seconds: readNullablePositiveInteger(record['next_poll_after_seconds']),
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
    payment_intent_id: readNullableString(record['payment_intent_id']),
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
    provider_payment_id: readNullableString(record['provider_payment_id']),
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

export function mapPaymentMovement(value: unknown): PaymentMovement {
  const record = recordOrEmpty(value);
  const kind = readMovementKind(record['kind']);

  if (!hasMovementKind(record)) {
    if (looksLikePaymentIntent(record)) {
      return movementFromLegacyPaymentIntent(mapPaymentIntent(value));
    }

    return movementFromLegacyPayment(mapPayment(value));
  }

  const status = readMovementStatus(record['status']);
  const isSuccessful = readBoolean(record['is_successful'], isSuccessfulStatus(status));
  const isPending = readBoolean(record['is_pending'], isPendingStatus(status));
  const isFinal = readBoolean(record['is_final'], isFinalStatus(status));

  return {
    id: readString(record['id']),
    kind,
    status,
    display_status: readNullableString(record['display_status']),
    is_final: isFinal,
    is_successful: isSuccessful,
    is_pending: isPending,
    can_retry: readBoolean(record['can_retry'], false),
    can_continue_checkout: readBoolean(record['can_continue_checkout'], false),
    can_refresh_status: readBoolean(record['can_refresh_status'], false),
    can_view_booking: readBoolean(record['can_view_booking'], !!readMovementBooking(record['booking'])),
    amount: readNumber(record['amount']),
    currency: readString(record['currency']) || 'UYU',
    provider: readProvider(record['provider']),
    provider_label: readNullableString(record['provider_label']),
    provider_reference: readNullableString(record['provider_reference']),
    provider_status: readNullableString(record['provider_status']),
    checkout_url: readNullableString(record['checkout_url']),
    booking: readMovementBooking(record['booking']),
    package_product: readNullableValue(record['package_product']),
    client_package: readNullableValue(record['client_package']),
    payment_intent_id: readNullableString(record['payment_intent_id']),
    created_at: readNullableString(record['created_at']),
    updated_at: readNullableString(record['updated_at']),
    paid_at: readNullableString(record['paid_at']),
    failed_at: readNullableString(record['failed_at']),
    expires_at: readNullableString(record['expires_at']),
    next_poll_after_seconds: readNullablePositiveInteger(record['next_poll_after_seconds']),
  };
}

export function mapPaymentHistoryItem(
  value: unknown,
  fallbackSource?: PaymentHistorySource,
): PaymentHistoryItem {
  const record = recordOrEmpty(value);
  const source = fallbackSource ?? readPaymentHistorySource(record);

  if (source === 'payment_intent') {
    const paymentIntent = mapPaymentIntent(value);

    return {
      id: readString(record['id']) || paymentIntent.id,
      source,
      payment_id: readNullableString(record['payment_id']),
      payment_intent_id: readNullableString(record['payment_intent_id']) ?? paymentIntent.id,
      booking_id: readNullableString(record['booking_id']) ?? paymentIntent.booking_id,
      package_product_id:
        readNullableString(record['package_product_id']) ?? paymentIntent.package_product_id,
      provider: paymentIntent.provider,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      provider_reference: paymentIntent.provider_reference,
      provider_payment_id: readNullableString(record['provider_payment_id']),
      paid_at: paymentIntent.succeeded_at,
      failed_at: paymentIntent.failed_at,
      cancelled_at: paymentIntent.cancelled_at,
      created_at: paymentIntent.created_at,
      failure_reason: paymentIntent.failure_reason,
      booking: paymentIntent.booking ?? null,
      package_product: paymentIntent.package_product ?? null,
      client_package: mapOptionalPackageSummary(record['client_package']) ?? null,
      can_retry: paymentIntent.can_retry,
    };
  }

  const payment = mapPayment(value);

  return {
    id: readString(record['id']) || payment.id,
    source: 'payment',
    payment_id: readNullableString(record['payment_id']) ?? payment.id,
    payment_intent_id: payment.payment_intent_id,
    booking_id: payment.booking_id,
    package_product_id: payment.package_product_id,
    provider: payment.provider,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    provider_reference: payment.provider_reference,
    provider_payment_id: payment.provider_payment_id ?? null,
    paid_at: payment.paid_at,
    failed_at: payment.failed_at,
    cancelled_at: readNullableString(record['cancelled_at']),
    created_at: payment.created_at,
    failure_reason: payment.failure_reason,
    booking: payment.booking ?? null,
    package_product: payment.package_product ?? null,
    client_package: payment.client_package ?? null,
    can_retry: readOptionalBoolean(record['can_retry']),
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

function mapOptionalPaymentIntent(value: unknown): PaymentIntent | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;
  return mapPaymentIntent(value);
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
    sessions_count: readNullablePositiveInteger(value['sessions_count']) ?? undefined,
    service_id: readServiceId(value['service_id']),
  };
}

function mapOptionalPackageProductSummary(
  value: unknown,
): PaymentPackageProductSummary | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;

  return {
    id: readString(value['id']),
    name: readString(value['name']) || 'Paquete',
    sessions_count: readNullablePositiveInteger(value['sessions_count']) ?? 0,
    service_id: readServiceId(value['service_id']),
  };
}

function mapHistoryPackageProduct(
  value: PaymentPackageProductSummary | PaymentPackageSummary | null | undefined,
): PaymentPackageProductSummary | null {
  if (!value) return null;

  return {
    id: value.id,
    name: value.name,
    sessions_count: value.sessions_count ?? 0,
    service_id: value.service_id ?? null,
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
  return readString(value).toLowerCase() || 'simulator';
}

function readPaymentHistorySource(record: UnknownRecord): PaymentHistorySource {
  if (record['source'] === 'payment_intent' || record['kind'] === 'payment_intent') {
    return 'payment_intent';
  }

  if (record['source'] === 'payment' || record['kind'] === 'payment') {
    return 'payment';
  }

  if (
    isRecord(record['payment_intent']) ||
    isRecord(record['paymentIntent']) ||
    isRecord(record['intent']) ||
    looksLikePaymentIntent(record)
  ) {
    return 'payment_intent';
  }

  return 'payment';
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

function movementFromLegacyPayment(payment: Payment): PaymentMovement {
  const status = legacyPaymentStatusToMovementStatus(payment.status);
  const isSuccessful = isSuccessfulStatus(status);

  return {
    id: payment.id,
    kind: 'payment',
    status,
    display_status: null,
    is_final: !isPendingStatus(status),
    is_successful: isSuccessful,
    is_pending: isPendingStatus(status),
    can_retry: false,
    can_continue_checkout: false,
    can_refresh_status: false,
    can_view_booking: !!payment.booking_id,
    amount: payment.amount,
    currency: payment.currency,
    provider: payment.provider,
    provider_label: null,
    provider_reference: payment.provider_reference,
    provider_status: null,
    checkout_url: null,
    booking: payment.booking
      ? {
          id: payment.booking.id,
          status: payment.booking.status,
          starts_at: payment.booking.starts_at,
        }
      : payment.booking_id
        ? { id: payment.booking_id }
        : null,
    package_product: payment.package_product,
    client_package: payment.client_package,
    payment_intent_id: payment.payment_intent_id || null,
    created_at: payment.created_at,
    updated_at: payment.updated_at,
    paid_at: payment.paid_at,
    failed_at: payment.failed_at,
    expires_at: null,
    next_poll_after_seconds: null,
  };
}

function movementFromLegacyPaymentIntent(paymentIntent: PaymentIntent): PaymentMovement {
  const status = readMovementStatus(paymentIntent.status);

  return {
    id: paymentIntent.id,
    kind: 'payment_intent',
    status,
    display_status: null,
    is_final: isFinalStatus(status),
    is_successful: isSuccessfulStatus(status),
    is_pending: isPendingStatus(status),
    can_retry: paymentIntent.can_retry ?? false,
    can_continue_checkout: paymentIntent.can_continue_checkout ?? false,
    can_refresh_status: paymentIntent.can_refresh_status ?? isPendingStatus(status),
    can_view_booking: paymentIntent.can_view_booking ?? !!paymentIntent.booking_id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    provider: paymentIntent.provider,
    provider_label: null,
    provider_reference: paymentIntent.provider_reference,
    provider_status: null,
    checkout_url: paymentIntent.checkout_url,
    booking: paymentIntent.booking
      ? {
          id: paymentIntent.booking.id,
          status: paymentIntent.booking.status,
          starts_at: paymentIntent.booking.starts_at,
        }
      : paymentIntent.booking_id
        ? { id: paymentIntent.booking_id }
        : null,
    package_product: paymentIntent.package_product,
    client_package: null,
    payment_intent_id: null,
    created_at: paymentIntent.created_at,
    updated_at: paymentIntent.updated_at,
    paid_at: paymentIntent.succeeded_at,
    failed_at: paymentIntent.failed_at,
    expires_at: paymentIntent.expires_at,
    next_poll_after_seconds: paymentIntent.next_poll_after_seconds ?? null,
  };
}

function dedupeSuccessfulIntentMovements(movements: PaymentMovement[]): PaymentMovement[] {
  const successfulPaymentIntentIds = new Set(
    movements
      .filter((movement) => movement.kind === 'payment' && movement.is_successful)
      .map((movement) => movement.payment_intent_id)
      .filter((id): id is string => !!id),
  );

  return movements.filter(
    (movement) =>
      !(
        movement.kind === 'payment_intent' &&
        movement.is_successful &&
        successfulPaymentIntentIds.has(movement.id)
      ),
  );
}

function hasMovementKind(record: UnknownRecord): boolean {
  return record['kind'] === 'payment' || record['kind'] === 'payment_intent';
}

function looksLikePaymentIntent(record: UnknownRecord): boolean {
  return (
    'payable_type' in record ||
    'payable_id' in record ||
    'checkout_url' in record ||
    'processing_at' in record ||
    'succeeded_at' in record
  );
}

function readMovementKind(value: unknown): PaymentMovementKind {
  return value === 'payment' ? 'payment' : 'payment_intent';
}

function readMovementStatus(value: unknown): PaymentMovementStatus {
  const text = readString(value).toLowerCase();
  if (text === 'approved') return 'paid';
  if (text === 'partially_refunded') return 'refunded';
  return movementStatuses.includes(text as PaymentMovementStatus)
    ? (text as PaymentMovementStatus)
    : 'unknown';
}

function legacyPaymentStatusToMovementStatus(status: PaymentStatus): PaymentMovementStatus {
  return readMovementStatus(status);
}

function readMovementBooking(value: unknown): PaymentMovementBooking | null {
  if (!isRecord(value)) return null;

  const id = readString(value['id']);
  return id
    ? {
        id,
        status: readNullableString(value['status']),
        starts_at: readNullableString(value['starts_at']),
      }
    : null;
}

function isSuccessfulStatus(status: PaymentMovementStatus): boolean {
  return status === 'paid' || status === 'succeeded' || status === 'completed';
}

function isPendingStatus(status: PaymentMovementStatus): boolean {
  return (
    status === 'pending' ||
    status === 'checkout_created' ||
    status === 'processing' ||
    status === 'pending_capture'
  );
}

function isFinalStatus(status: PaymentMovementStatus): boolean {
  return !isPendingStatus(status) && status !== 'unknown';
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
  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;
  return fallback;
}

function readOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  return readBoolean(value, false);
}

function readNullablePositiveInteger(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Math.trunc(readNumber(value));
  return parsed > 0 ? parsed : null;
}

function readNullableValue(value: unknown): unknown | null {
  return value === undefined ? null : value;
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
