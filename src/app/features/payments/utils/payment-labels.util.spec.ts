import { PaymentMovement } from '../data-access/payments.models';
import { getPaymentStatusUi } from './payment-labels.util';

function movement(status: PaymentMovement['status'], display_status: string | null = null): PaymentMovement {
  return {
    id: 'movement-1',
    kind: 'payment_intent',
    status,
    display_status,
    is_final: false,
    is_successful: false,
    is_pending: false,
    can_retry: false,
    can_continue_checkout: false,
    can_refresh_status: false,
    can_view_booking: false,
    amount: 0,
    currency: 'UYU',
    provider: 'paypal',
    provider_label: null,
    provider_reference: null,
    provider_status: null,
    checkout_url: null,
    booking: null,
    package_product: null,
    client_package: null,
    payment_intent_id: null,
    created_at: null,
    updated_at: null,
    paid_at: null,
    failed_at: null,
    expires_at: null,
    next_poll_after_seconds: null,
  };
}

describe('getPaymentStatusUi', () => {
  it.each([
    ['paid', 'Pagado', 'success'],
    ['pending', 'Pendiente', 'warning'],
    ['checkout_created', 'Checkout creado', 'info'],
    ['processing', 'Procesando', 'warning'],
    ['failed', 'Fallido', 'danger'],
    ['cancelled', 'Cancelado', 'neutral'],
    ['expired', 'Expirado', 'neutral'],
    ['refunded', 'Reembolsado', 'info'],
    ['unknown', 'Desconocido', 'neutral'],
  ] as const)('maps %s to a readable %s badge', (status, label, tone) => {
    expect(getPaymentStatusUi(movement(status))).toEqual({ label, tone });
  });

  it('keeps the backend display status while preserving the fallback tone', () => {
    expect(getPaymentStatusUi(movement('checkout_created', 'Esperando autorizacion'))).toEqual({
      label: 'Esperando autorizacion',
      tone: 'info',
    });
  });
});
