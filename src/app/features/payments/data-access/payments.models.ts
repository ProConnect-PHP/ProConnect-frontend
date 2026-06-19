export type PaymentProvider = 'simulator' | 'mercadopago' | 'paypal';

export type PayableType = 'booking' | 'package';

export type PaymentIntentStatus =
  | 'pending'
  | 'checkout_created'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'expired';

export type PaymentStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

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
