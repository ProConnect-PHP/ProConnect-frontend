export type KnownPaymentProvider = 'simulator' | 'mercadopago' | 'paypal';

/**
 * Providers are backend-owned. Keep the known values for selector UIs while
 * allowing a newly configured provider to be displayed before the frontend is
 * deployed again.
 */
export type PaymentProvider = KnownPaymentProvider | (string & {});

export type PayableType = 'booking' | 'package';

export type PaymentIntentStatus =
  | 'pending'
  | 'checkout_created'
  | 'processing'
  | 'pending_capture'
  | 'paid'
  | 'succeeded'
  | 'completed'
  | 'failed'
  | 'denied'
  | 'cancelled'
  | 'expired'
  | 'unknown';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'succeeded'
  | 'completed'
  | 'failed'
  | 'denied'
  | 'expired'
  | 'refunded'
  | 'partially_refunded'
  | 'unknown';

export interface PaymentBookingSummary {
  id: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  service_id: string | number | null;
  service?: {
    id: string | number;
    name: string;
  } | null;
}

export interface PaymentPartySummary {
  id: string;
  name: string;
}

export interface PaymentPackageSummary {
  id: string;
  name: string;
}

export interface Payment {
  id: string;
  payment_intent_id: string;
  booking_id: string | null;
  package_product_id: string | null;
  client_package_id: string | null;
  client_id: string | null;
  professional_id: string | null;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: string;
  provider_reference: string | null;
  metadata: Record<string, unknown> | null;
  paid_at: string | null;
  failed_at: string | null;
  refunded_at: string | null;
  failure_reason: string | null;
  booking?: PaymentBookingSummary | null;
  package_product?: PaymentPackageSummary | null;
  client_package?: PaymentPackageSummary | null;
  client?: PaymentPartySummary | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaymentIntent {
  id: string;
  payable_type: PayableType;
  payable_id: string;
  booking_id: string | null;
  package_product_id: string | null;
  client_id: string | null;
  professional_id: string | null;
  provider: PaymentProvider;
  status: PaymentIntentStatus;
  amount: number;
  currency: string;
  checkout_url: string | null;
  provider_reference: string | null;
  metadata: Record<string, unknown> | null;
  expires_at: string | null;
  processing_at: string | null;
  succeeded_at: string | null;
  failed_at: string | null;
  cancelled_at: string | null;
  failure_reason: string | null;
  can_retry?: boolean;
  can_continue_checkout?: boolean;
  can_refresh_status?: boolean;
  can_view_booking?: boolean;
  next_poll_after_seconds?: number | null;
  payment?: Payment | null;
  booking?: PaymentBookingSummary | null;
  package_product?: PaymentPackageSummary | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreatePaymentIntentRequest {
  payable_type: PayableType;
  payable_id: string;
  provider?: PaymentProvider;
}

export interface CreatePaymentCheckoutRequest {
  provider: PaymentProvider;
}

export interface SimulatePaymentFailurePayload {
  failure_reason: string;
}

export interface PaymentStatusResult {
  payment_intent: PaymentIntent;
  payment: Payment | null;
  next_poll_after_seconds?: number | null;
}

export interface PaymentsPaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedPayments {
  payments: Payment[];
  meta: PaymentsPaginationMeta;
}

export interface PaymentListParams {
  page?: number;
  per_page?: number;
}

export type PaymentMovementKind = 'payment' | 'payment_intent';

export type PaymentMovementStatus =
  | 'paid'
  | 'succeeded'
  | 'completed'
  | 'pending'
  | 'checkout_created'
  | 'processing'
  | 'pending_capture'
  | 'failed'
  | 'denied'
  | 'cancelled'
  | 'expired'
  | 'refunded'
  | 'unknown';

export interface PaymentMovementBooking {
  id: string;
  status?: string | null;
  starts_at?: string | null;
}

/** A client-facing movement returned by the unified `payments/my` endpoint. */
export interface PaymentMovement {
  id: string;
  kind: PaymentMovementKind;
  status: PaymentMovementStatus;
  display_status: string | null;
  is_final: boolean;
  is_successful: boolean;
  is_pending: boolean;
  can_retry: boolean;
  can_continue_checkout: boolean;
  can_refresh_status: boolean;
  can_view_booking: boolean;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  provider_label: string | null;
  provider_reference: string | null;
  provider_status: string | null;
  checkout_url: string | null;
  booking: PaymentMovementBooking | null;
  package_product: unknown | null;
  client_package: unknown | null;
  /** Present in legacy payment records and used only to avoid duplicate successes. */
  payment_intent_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  paid_at: string | null;
  failed_at: string | null;
  expires_at: string | null;
  next_poll_after_seconds: number | null;
}

export interface PaymentMovementsResponse {
  payments: PaymentMovement[];
  meta: PaymentsPaginationMeta;
}

export interface ClientPaymentsQuery extends PaymentListParams {
  status?: PaymentMovementStatus | string;
  provider?: PaymentProvider | string;
  kind?: PaymentMovementKind;
  booking_id?: string;
  only_pending?: boolean;
  only_final?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
}
