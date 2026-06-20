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

  it('requests only confirmed payments from the client payments endpoint', async () => {
    apiClient.get.mockReturnValue(
      of({
        data: [
          {
            id: 'payment-1',
            payment_intent_id: 'intent-1',
            provider: 'paypal',
            status: 'succeeded',
            amount: 1800,
            currency: 'UYU',
          },
        ],
      }),
    );
    const service = TestBed.inject(PaymentsApi);

    const payments = await firstValueFrom(service.getMyPayments());

    expect(apiClient.get).toHaveBeenCalledWith('me/payments');
    expect(payments).toHaveLength(1);
    expect(payments[0]?.id).toBe('payment-1');
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
    expect(detail.payment.id).toBe('payment-1');
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
