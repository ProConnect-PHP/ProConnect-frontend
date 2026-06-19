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
});
