import {
  unwrapPaginatedPaymentsResponse,
  unwrapPaymentIntentResponse,
  unwrapPaymentResponse,
  unwrapPaymentStatusResponse,
} from './payments.mapper';

describe('payments mapper', () => {
  it('unwraps generic payment intent responses', () => {
    const paymentIntent = unwrapPaymentIntentResponse({
      payment_intent: {
        id: 'intent-1',
        payable_type: 'booking',
        payable_id: 'booking-1',
        provider: 'paypal',
        status: 'checkout_created',
        amount: '1800',
        currency: 'UYU',
        checkout_url: 'https://paypal.test/checkout',
        expires_at: '2026-06-12T12:30:00Z',
      },
    });

    expect(paymentIntent.id).toBe('intent-1');
    expect(paymentIntent.payable_type).toBe('booking');
    expect(paymentIntent.booking_id).toBe('booking-1');
    expect(paymentIntent.amount).toBe(1800);
    expect(paymentIntent.status).toBe('checkout_created');
    expect(paymentIntent.checkout_url).toBe('https://paypal.test/checkout');
  });

  it('unwraps ApiResponse payment responses', () => {
    const payment = unwrapPaymentResponse({
      success: true,
      data: {
        payment: {
          id: 'payment-1',
          payment_intent_id: 'intent-1',
          booking_id: 'booking-1',
          provider: 'mercadopago',
          status: 'approved',
          amount: 1800,
          currency: 'UYU',
          paid_at: '2026-06-12T12:05:00Z',
        },
      },
    });

    expect(payment.id).toBe('payment-1');
    expect(payment.status).toBe('approved');
    expect(payment.paid_at).toBe('2026-06-12T12:05:00Z');
  });

  it('unwraps payment status responses with intent and payment', () => {
    const result = unwrapPaymentStatusResponse({
      data: {
        payment_intent: {
          id: 'intent-1',
          payable_type: 'package',
          payable_id: 'package-1',
          provider: 'paypal',
          status: 'succeeded',
          amount: 5600,
          currency: 'UYU',
        },
        payment: {
          id: 'payment-1',
          payment_intent_id: 'intent-1',
          package_product_id: 'package-1',
          provider: 'paypal',
          status: 'succeeded',
          amount: 5600,
          currency: 'UYU',
        },
      },
    });

    expect(result.payment_intent.payable_type).toBe('package');
    expect(result.payment_intent.package_product_id).toBe('package-1');
    expect(result.payment?.status).toBe('succeeded');
  });

  it('unwraps paginated payment responses', () => {
    const response = unwrapPaginatedPaymentsResponse({
      success: true,
      data: {
        payments: [
          {
            id: 'payment-1',
            payment_intent_id: 'intent-1',
            booking_id: 'booking-1',
            provider: 'simulator',
            status: 'succeeded',
            amount: 1800,
            currency: 'UYU',
            created_at: null,
          },
        ],
        meta: {
          current_page: 1,
          per_page: 10,
          total: 1,
          last_page: 1,
        },
      },
    });

    expect(response.payments).toHaveLength(1);
    expect(response.payments[0].booking_id).toBe('booking-1');
    expect(response.meta.total).toBe(1);
  });
});
