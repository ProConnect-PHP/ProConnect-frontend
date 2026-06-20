import {
  PaymentIntentStatus,
  PaymentMovement,
  PaymentMovementStatus,
  PaymentProvider,
  PaymentStatus,
} from '../data-access/payments.models';

export type PaymentStatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface PaymentStatusUi {
  label: string;
  tone: PaymentStatusTone;
}

export function paymentProviderLabel(provider: PaymentProvider): string {
  switch (provider) {
    case 'simulator':
      return 'Simulador';
    case 'mercadopago':
      return 'Mercado Pago';
    case 'paypal':
      return 'PayPal';
    default:
      return provider || 'Proveedor de pago';
  }
}

/** Uses the backend display text when present, with a stable local fallback. */
export function getPaymentStatusUi(
  payment: Pick<PaymentMovement, 'status' | 'display_status'>,
): PaymentStatusUi {
  const fallback = statusUiFor(payment.status);
  const displayStatus = payment.display_status?.trim();

  return {
    ...fallback,
    label: displayStatus || fallback.label,
  };
}

export function paymentStatusUi(
  status: PaymentMovementStatus | PaymentIntentStatus | PaymentStatus | string,
  displayStatus: string | null = null,
): PaymentStatusUi {
  return getPaymentStatusUi({
    status: normalizeMovementStatus(status),
    display_status: displayStatus,
  });
}

export function paymentStatusLabel(
  status: PaymentIntentStatus | PaymentStatus | string,
): string {
  switch (status) {
    case 'paid':
    case 'approved':
    case 'succeeded':
    case 'completed':
      return 'Pagado';
    case 'pending':
      return 'Pendiente';
    case 'checkout_created':
      return 'Checkout creado';
    case 'processing':
    case 'pending_capture':
      return 'Procesando';
    case 'rejected':
      return 'Rechazado';
    case 'denied':
    case 'failed':
      return 'Fallido';
    case 'cancelled':
      return 'Cancelado';
    case 'expired':
      return 'Expirado';
    case 'refunded':
      return 'Reembolsado';
    case 'partially_refunded':
      return 'Reembolso parcial';
    case 'unknown':
      return 'Desconocido';
    default:
      return 'Sin estado';
  }
}

function statusUiFor(status: PaymentMovementStatus): PaymentStatusUi {
  switch (status) {
    case 'paid':
    case 'succeeded':
    case 'completed':
      return { label: 'Pagado', tone: 'success' };
    case 'pending':
      return { label: 'Pendiente', tone: 'warning' };
    case 'checkout_created':
      return { label: 'Checkout creado', tone: 'info' };
    case 'processing':
    case 'pending_capture':
      return { label: 'Procesando', tone: 'warning' };
    case 'rejected':
      return { label: 'Rechazado', tone: 'danger' };
    case 'failed':
    case 'denied':
      return { label: 'Fallido', tone: 'danger' };
    case 'cancelled':
      return { label: 'Cancelado', tone: 'neutral' };
    case 'expired':
      return { label: 'Expirado', tone: 'neutral' };
    case 'refunded':
      return { label: 'Reembolsado', tone: 'info' };
    case 'unknown':
      return { label: 'Desconocido', tone: 'neutral' };
  }
}

function normalizeMovementStatus(status: string): PaymentMovementStatus {
  switch (status) {
    case 'approved':
      return 'paid';
    case 'partially_refunded':
      return 'refunded';
    case 'paid':
    case 'succeeded':
    case 'completed':
    case 'pending':
    case 'checkout_created':
    case 'processing':
    case 'pending_capture':
    case 'failed':
    case 'rejected':
    case 'denied':
    case 'cancelled':
    case 'expired':
    case 'refunded':
    case 'unknown':
      return status;
    default:
      return 'unknown';
  }
}
