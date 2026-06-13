import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PaymentsApi } from '../data-access/payments.api';
import { PaymentIntent } from '../data-access/payments.models';
import { PaymentRedirectService } from '../services/payment-redirect.service';
import { PaymentCheckoutStore } from './payment-checkout.store';

const pendingIntent: PaymentIntent = {
  id: 'intent-1',
  payable_type: 'booking',
  payable_id: 'booking-1',
  booking_id: 'booking-1',
  package_product_id: null,
  client_id: null,
  professional_id: null,
  provider: 'paypal',
  status: 'pending',
  amount: 1800,
  currency: 'UYU',
  checkout_url: null,
  provider_reference: null,
  metadata: null,
  expires_at: null,
  processing_at: null,
  succeeded_at: null,
  failed_at: null,
  cancelled_at: null,
  failure_reason: null,
  created_at: null,
  updated_at: null,
};

describe('PaymentCheckoutStore', () => {
  const api = {
    createPaymentIntent: vi.fn(),
    createCheckout: vi.fn(),
  };
  const redirectService = {
    remember: vi.fn(),
    redirectToCheckout: vi.fn(),
  };

  beforeEach(() => {
    api.createPaymentIntent.mockReset();
    api.createCheckout.mockReset();
    redirectService.remember.mockReset();
    redirectService.redirectToCheckout.mockReset();

    TestBed.configureTestingModule({
      providers: [
        PaymentCheckoutStore,
        { provide: PaymentsApi, useValue: api },
        { provide: PaymentRedirectService, useValue: redirectService },
      ],
    });
  });

  it('creates an intent, creates checkout and redirects to checkout_url', () => {
    const checkoutIntent = {
      ...pendingIntent,
      status: 'checkout_created' as const,
      checkout_url: 'https://paypal.test/checkout',
    };
    api.createPaymentIntent.mockReturnValue(of(pendingIntent));
    api.createCheckout.mockReturnValue(of(checkoutIntent));

    const store = TestBed.inject(PaymentCheckoutStore);
    store.selectProvider('paypal');
    store.startCheckout('booking', 'booking-1');

    expect(api.createPaymentIntent).toHaveBeenCalledWith({
      payable_type: 'booking',
      payable_id: 'booking-1',
      provider: 'paypal',
    });
    expect(api.createCheckout).toHaveBeenCalledWith('intent-1', {
      provider: 'paypal',
    });
    expect(redirectService.remember).toHaveBeenCalledWith(checkoutIntent);
    expect(redirectService.redirectToCheckout).toHaveBeenCalledWith(
      'https://paypal.test/checkout',
    );
  });

  it('shows an error when an external checkout has no checkout_url', () => {
    api.createPaymentIntent.mockReturnValue(of(pendingIntent));
    api.createCheckout.mockReturnValue(
      of({ ...pendingIntent, status: 'checkout_created' as const }),
    );

    const store = TestBed.inject(PaymentCheckoutStore);
    store.selectProvider('paypal');
    store.startCheckout('booking', 'booking-1');

    expect(store.error()).toBe('No se pudo obtener la URL de pago.');
    expect(redirectService.redirectToCheckout).not.toHaveBeenCalled();
  });

  it('keeps simulator checkout inside the app', () => {
    const simulatorIntent: PaymentIntent = {
      ...pendingIntent,
      provider: 'simulator',
      status: 'checkout_created',
    };
    api.createPaymentIntent.mockReturnValue(of({ ...simulatorIntent, status: 'pending' }));
    api.createCheckout.mockReturnValue(of(simulatorIntent));

    const store = TestBed.inject(PaymentCheckoutStore);
    store.selectProvider('simulator');
    store.startCheckout('booking', 'booking-1');

    expect(store.simulatorReady()).toBe(true);
    expect(redirectService.redirectToCheckout).not.toHaveBeenCalled();
  });
});
