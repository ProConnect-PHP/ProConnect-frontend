import {
  unwrapPaginatedPaymentsResponse,
  unwrapPaymentIntentResponse,
  unwrapPaymentResponse,
} from './payments.mapper';

describe('payments mapper', () => {
  it('unwraps direct payment intent responses', () => {
    const paymentIntent = unwrapPaymentIntentResponse({
      payment_intent: {
        id: 'intent-1',
        booking_id: 'booking-1',
        client_id: 'client-1',
        professional_id: 'professional-1',
        provider: 'simulator',
        status: 'pending',
        amount: '1800',
        currency: 'UYU',
        provider_reference: 'sim_intent-1',
        metadata: {},
        expires_at: '2026-06-01 12:30:00',
        created_at: '2026-06-01 12:00:00',
      },
    });

    expect(paymentIntent.id).toBe('intent-1');
    expect(paymentIntent.amount).toBe(1800);
    expect(paymentIntent.status).toBe('pending');
  });

  it('unwraps ApiResponse payment responses', () => {
    const payment = unwrapPaymentResponse({
      success: true,
      data: {
        payment: {
          id: 'payment-1',
          payment_intent_id: 'intent-1',
          booking_id: 'booking-1',
          client_id: 'client-1',
          professional_id: 'professional-1',
          provider: 'simulator',
          status: 'succeeded',
          amount: 1800,
          currency: 'UYU',
          provider_reference: 'sim_payment-1',
          paid_at: '2026-06-01 12:05:00',
          created_at: '2026-06-01 12:05:00',
        },
      },
    });

    expect(payment.id).toBe('payment-1');
    expect(payment.status).toBe('succeeded');
    expect(payment.paid_at).toBe('2026-06-01 12:05:00');
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
            client_id: 'client-1',
            professional_id: 'professional-1',
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
