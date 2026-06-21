import {
  unwrapPaymentMovementsResponse,
  unwrapPaymentMovementResponse,
  unwrapPaginatedPaymentsResponse,
  unwrapPaymentDetailResponse,
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

  it('unwraps payment details from the item envelope using nested payment data', () => {
    const detail = unwrapPaymentDetailResponse({
      item: {
        id: 'payment:payment-1',
        source: 'payment',
        payment_id: 'payment-1',
        payment_intent_id: 'intent-1',
        booking_id: 'booking-1',
        package_product_id: null,
        provider: 'paypal',
        status: 'succeeded',
        display_status: 'paid',
        amount: 500,
        currency: 'UYU',
        provider_reference: 'paypal-order-1',
        provider_payment_id: 'paypal-capture-1',
        paid_at: '2026-06-20 23:16:52',
        failed_at: null,
        created_at: '2026-06-20 20:16:53',
        failure_reason: null,
        can_retry: false,
        payment: {
          id: 'payment-1',
          payment_intent_id: 'intent-1',
          booking_id: 'booking-1',
          package_product_id: null,
          provider: 'paypal',
          status: 'succeeded',
          amount: 500,
          currency: 'UYU',
          provider_reference: 'paypal-order-1',
          provider_payment_id: 'paypal-capture-1',
          paid_at: '2026-06-20 23:16:52',
          failed_at: null,
          created_at: '2026-06-20 20:16:53',
        },
        payment_intent: {
          id: 'intent-1',
          payable_type: 'booking',
          payable_id: 'booking-1',
          booking_id: 'booking-1',
          package_product_id: null,
          provider: 'paypal',
          status: 'succeeded',
          amount: 500,
          currency: 'UYU',
          provider_reference: 'paypal-order-1',
          succeeded_at: '2026-06-20 23:16:52',
          created_at: '2026-06-20 20:16:25',
        },
        booking: {
          id: 'booking-1',
          status: 'paid',
          starts_at: '2026-06-22 09:00:00',
          ends_at: '2026-06-22 10:00:00',
          service_id: 'service-1',
        },
        package_product: null,
        related_attempts: [
          {
            id: 'intent-1',
            payable_type: 'booking',
            payable_id: 'booking-1',
            booking_id: 'booking-1',
            provider: 'paypal',
            status: 'succeeded',
            amount: 500,
            currency: 'UYU',
            provider_reference: 'paypal-order-1',
            succeeded_at: '2026-06-20 23:16:52',
            created_at: '2026-06-20 20:16:25',
          },
        ],
      },
    });

    expect(detail.source).toBe('payment');
    expect(detail.operation).toMatchObject({
      id: 'payment:payment-1',
      status: 'succeeded',
      display_status: 'paid',
      amount: 500,
      paid_at: '2026-06-20 23:16:52',
      provider_payment_id: 'paypal-capture-1',
    });
    expect(detail.payment?.id).toBe('payment-1');
    expect(detail.payment_intent?.id).toBe('intent-1');
    expect(detail.booking?.status).toBe('paid');
    expect(detail.successful_intent?.id).toBe('intent-1');
    expect(detail.related_attempts).toHaveLength(1);
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

  it('maps unified payment movements and removes a duplicated successful intent', () => {
    const response = unwrapPaymentMovementsResponse({
      data: {
        payments: [
          {
            id: 'intent-1',
            kind: 'payment_intent',
            status: 'succeeded',
            is_successful: true,
            is_final: true,
            amount: 1800,
            currency: 'UYU',
            provider: 'paypal',
          },
          {
            id: 'payment-1',
            kind: 'payment',
            payment_intent_id: 'intent-1',
            status: 'paid',
            display_status: 'Pagado',
            is_successful: true,
            is_final: true,
            amount: 1800,
            currency: 'UYU',
            provider: 'paypal',
          },
          {
            id: 'intent-2',
            kind: 'payment_intent',
            status: 'checkout_created',
            display_status: 'Checkout creado',
            is_pending: true,
            can_continue_checkout: true,
            can_refresh_status: true,
            amount: '1900',
            currency: 'UYU',
            provider: 'paypal',
            provider_reference: '7HJ11981UA509071K',
            booking: { id: 'booking-1', status: 'pending' },
          },
        ],
        meta: { current_page: 1, per_page: 10, total: 3, last_page: 1 },
      },
    });

    expect(response.payments).toHaveLength(2);
    expect(response.payments.map((payment) => payment.id)).toEqual(['payment-1', 'intent-2']);
    expect(response.payments[1]).toMatchObject({
      kind: 'payment_intent',
      status: 'checkout_created',
      amount: 1900,
      can_continue_checkout: true,
      can_refresh_status: true,
      booking: { id: 'booking-1' },
    });
  });

  it('adapts the legacy payment-only list to unified movements', () => {
    const response = unwrapPaymentMovementsResponse({
      payments: [
        {
          id: 'payment-1',
          payment_intent_id: 'intent-1',
          booking_id: 'booking-1',
          provider: 'mercadopago',
          status: 'approved',
          amount: 1800,
          currency: 'UYU',
        },
      ],
      meta: { current_page: 1, per_page: 10, total: 1, last_page: 1 },
    });

    expect(response.payments[0]).toMatchObject({
      id: 'payment-1',
      kind: 'payment',
      status: 'paid',
      is_successful: true,
      can_view_booking: true,
      booking: { id: 'booking-1' },
    });
  });

  it('adapts the legacy payment intent status response for an individual refresh', () => {
    const payment = unwrapPaymentMovementResponse({
      data: {
        payment_intent: {
          id: 'intent-1',
          payable_type: 'booking',
          payable_id: 'booking-1',
          provider: 'paypal',
          status: 'processing',
          amount: 1900,
          currency: 'UYU',
          can_refresh_status: true,
          booking: { id: 'booking-1', status: 'pending' },
        },
      },
    });

    expect(payment).toMatchObject({
      id: 'intent-1',
      kind: 'payment_intent',
      status: 'processing',
      can_refresh_status: true,
      booking: { id: 'booking-1' },
    });
  });
});
