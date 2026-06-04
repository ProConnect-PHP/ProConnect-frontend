export type PaymentIntentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'expired';

export type PaymentStatus = 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';

export type PaymentProvider = 'simulator' | 'mercadopago' | 'paypal' | 'stripe';

export interface PaymentBookingSummary {
  id: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  service_id: string | number | null;
}

export interface Payment {
  id: string;
  payment_intent_id: string;
  booking_id: string;
  client_id: string;
  professional_id: string;
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
  created_at: string | null;
}

export interface PaymentIntent {
  id: string;
  booking_id: string;
  client_id: string;
  professional_id: string;
  provider: PaymentProvider;
  status: PaymentIntentStatus;
  amount: number;
  currency: string;
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
  created_at: string | null;
}

export interface CreatePaymentIntentPayload {
  metadata?: Record<string, unknown>;
}

export interface SimulatePaymentFailurePayload {
  failure_reason?: string | null;
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
