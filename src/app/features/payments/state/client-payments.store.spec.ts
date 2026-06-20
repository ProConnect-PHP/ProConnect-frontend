import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PaymentsApi } from '../data-access/payments.api';
import { PaymentMovement } from '../data-access/payments.models';
import { PaymentRedirectService } from '../services/payment-redirect.service';
import { ClientPaymentsStore } from './client-payments.store';

const baseMovement: PaymentMovement = {
  id: 'intent-1',
  kind: 'payment_intent',
  status: 'checkout_created',
  display_status: 'Checkout creado',
  is_final: false,
  is_successful: false,
  is_pending: true,
  can_retry: false,
  can_continue_checkout: true,
  can_refresh_status: true,
  can_view_booking: true,
  amount: 1900,
  currency: 'UYU',
  provider: 'paypal',
  provider_label: 'PayPal',
  provider_reference: 'paypal-order-1',
  provider_status: 'APPROVED',
  checkout_url: null,
  booking: { id: 'booking-1', status: 'pending', starts_at: null },
  package_product: null,
  client_package: null,
  payment_intent_id: null,
  created_at: '2026-06-20T02:31:01Z',
  updated_at: '2026-06-20T02:32:40Z',
  paid_at: null,
  failed_at: null,
  expires_at: null,
  next_poll_after_seconds: null,
};

describe('ClientPaymentsStore', () => {
  const api = {
    getMyPaymentMovements: vi.fn(),
    refreshPaymentMovement: vi.fn(),
    createCheckout: vi.fn(),
  };
  const redirectService = {
    redirectToCheckout: vi.fn(),
  };

  beforeEach(() => {
    api.getMyPaymentMovements.mockReset();
    api.refreshPaymentMovement.mockReset();
    api.createCheckout.mockReset();
    redirectService.redirectToCheckout.mockReset();

    TestBed.configureTestingModule({
      providers: [
        ClientPaymentsStore,
        { provide: PaymentsApi, useValue: api },
        { provide: PaymentRedirectService, useValue: redirectService },
      ],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('loads unified movements into signal state', () => {
    api.getMyPaymentMovements.mockReturnValue(
      of({
        payments: [baseMovement],
        meta: { current_page: 1, per_page: 10, total: 1, last_page: 1 },
      }),
    );
    const store = TestBed.inject(ClientPaymentsStore);

    store.load();

    expect(store.payments()).toEqual([baseMovement]);
    expect(store.meta().total).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('applies filters from page one', () => {
    api.getMyPaymentMovements.mockReturnValue(
      of({
        payments: [],
        meta: { current_page: 1, per_page: 10, total: 0, last_page: 1 },
      }),
    );
    const store = TestBed.inject(ClientPaymentsStore);

    store.updateFilters({ provider: 'paypal', only_pending: true });

    expect(api.getMyPaymentMovements).toHaveBeenCalledWith({
      page: 1,
      per_page: 10,
      provider: 'paypal',
      only_pending: true,
    });
  });

  it('replaces only the refreshed payment intent in memory', () => {
    api.refreshPaymentMovement.mockReturnValue(
      of({ ...baseMovement, status: 'processing', display_status: 'Procesando' }),
    );
    const store = TestBed.inject(ClientPaymentsStore);
    store.payments.set([baseMovement]);

    store.refreshMovement(baseMovement);

    expect(store.payments()[0]).toMatchObject({
      id: 'intent-1',
      status: 'processing',
      display_status: 'Procesando',
    });
    expect(api.refreshPaymentMovement).toHaveBeenCalledWith('intent-1');
  });
});
