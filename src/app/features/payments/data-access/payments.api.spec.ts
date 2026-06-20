import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import { PaymentsApi } from './payments.api';

describe('PaymentsApi', () => {
  const apiClient = {
    get: vi.fn(),
    post: vi.fn(),
  };

  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.post.mockReset();

    TestBed.configureTestingModule({
      providers: [
        PaymentsApi,
        { provide: ApiClient, useValue: apiClient },
      ],
    });
  });

  it('uses the generic intent and checkout endpoints', async () => {
    apiClient.post
      .mockReturnValueOnce(
        of({
          payment_intent: {
            id: 'intent-1',
            payable_type: 'booking',
            payable_id: 'booking-1',
            provider: 'paypal',
            status: 'pending',
          },
        }),
      )
      .mockReturnValueOnce(
        of({
          payment_intent: {
            id: 'intent-1',
            payable_type: 'booking',
            payable_id: 'booking-1',
            provider: 'paypal',
            status: 'checkout_created',
            checkout_url: 'https://paypal.test/checkout',
          },
        }),
      );

    const service = TestBed.inject(PaymentsApi);
    const payload = {
      payable_type: 'booking' as const,
      payable_id: 'booking-1',
      provider: 'paypal' as const,
    };

    await firstValueFrom(service.createPaymentIntent(payload));
    await firstValueFrom(service.createCheckout('intent-1', { provider: 'paypal' }));

    expect(apiClient.post).toHaveBeenNthCalledWith(1, 'payment-intents', payload);
    expect(apiClient.post).toHaveBeenNthCalledWith(
      2,
      'payment-intents/intent-1/checkout',
      { provider: 'paypal' },
    );
  });

  it('requests the authoritative payment status endpoint', async () => {
    apiClient.get.mockReturnValue(
      of({
        payment_intent: {
          id: 'intent-1',
          payable_type: 'booking',
          payable_id: 'booking-1',
          provider: 'mercadopago',
          status: 'processing',
        },
      }),
    );

    const service = TestBed.inject(PaymentsApi);
    await firstValueFrom(service.getPaymentStatus('intent-1'));

    expect(apiClient.get).toHaveBeenCalledWith('payment-intents/intent-1/status');
  });

  it('requests normalized payment history from the client payments endpoint', async () => {
    apiClient.get.mockReturnValue(
      of({
        data: [
          {
            id: 'payment:payment-1',
            source: 'payment',
            payment_id: 'payment-1',
            payment_intent_id: 'intent-1',
            booking_id: 'booking-1',
            package_product_id: null,
            provider: 'paypal',
            status: 'succeeded',
            display_status: 'paid',
            amount: 1800,
            currency: 'UYU',
            provider_reference: 'paypal-order-1',
            provider_payment_id: 'paypal-capture-1',
            paid_at: '2026-06-20 18:00:00',
            failed_at: null,
            cancelled_at: null,
            created_at: '2026-06-20 18:00:00',
            failure_reason: null,
            can_retry: false,
            booking: null,
            package_product: null,
          },
          {
            id: 'intent:intent-1',
            source: 'payment_intent',
            payment_id: null,
            payment_intent_id: 'intent-1',
            booking_id: 'booking-1',
            package_product_id: null,
            provider: 'mercadopago',
            status: 'checkout_created',
            display_status: 'not_confirmed',
            amount: 1600,
            currency: 'UYU',
            provider_reference: 'mp-preference-1',
            provider_payment_id: null,
            paid_at: null,
            failed_at: null,
            cancelled_at: null,
            created_at: '2026-06-20 19:00:00',
            failure_reason: 'No encontramos un pago asociado a este intento.',
            can_retry: true,
            booking: null,
            package_product: null,
          },
        ],
        links: {
          first: 'http://localhost/api/v1/me/payments?page=1',
          last: 'http://localhost/api/v1/me/payments?page=1',
          prev: null,
          next: null,
        },
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          path: 'http://localhost/api/v1/me/payments',
          per_page: 10,
          to: 2,
          total: 2,
        },
      }),
    );

    const service = TestBed.inject(PaymentsApi);

    const payments = await firstValueFrom(service.getMyPayments());

    expect(apiClient.get).toHaveBeenCalledWith('me/payments', {
      params: {
        page: 1,
        per_page: 10,
      },
    });

    expect(payments.data).toHaveLength(2);
    expect(payments.data[0]?.id).toBe('payment:payment-1');
    expect(payments.data[0]?.display_status).toBe('paid');
    expect(payments.data[1]?.display_status).toBe('not_confirmed');
    expect(payments.meta.current_page).toBe(1);
    expect(payments.meta.total).toBe(2);
  });

  it('requests a payment detail with its related attempts', async () => {
    apiClient.get.mockReturnValue(
      of({
        payment: {
          id: 'payment-1',
          payment_intent_id: 'intent-1',
          provider: 'paypal',
          status: 'succeeded',
          amount: 1800,
          currency: 'UYU',
        },
        booking: null,
        package_product: null,
        successful_intent: null,
        related_attempts: [],
      }),
    );
    const service = TestBed.inject(PaymentsApi);

    const detail = await firstValueFrom(service.getMyPayment('payment-1'));

    expect(apiClient.get).toHaveBeenCalledWith('me/payments/payment-1');
    expect(detail.source).toBe('payment');
    expect(detail.payment?.id).toBe('payment-1');
    expect(detail.related_attempts).toEqual([]);
  });

  it('keeps the unified movements endpoint behind its explicit legacy method', async () => {
    apiClient.get.mockReturnValue(of({ payments: [], meta: {} }));
    const service = TestBed.inject(PaymentsApi);

    await firstValueFrom(service.getMyPaymentMovements({ only_pending: true }));

    expect(apiClient.get).toHaveBeenCalledWith('payments/my', {
      params: {
        page: undefined,
        per_page: undefined,
        status: undefined,
        provider: undefined,
        kind: undefined,
        booking_id: undefined,
        only_pending: true,
        only_final: undefined,
        date_from: undefined,
        date_to: undefined,
        search: undefined,
      },
    });
  });
});
