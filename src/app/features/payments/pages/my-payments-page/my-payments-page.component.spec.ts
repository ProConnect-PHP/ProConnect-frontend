import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { PaymentsApi } from '../../data-access/payments.api';
import {
  PaginatedResponse,
  PaymentHistoryItem,
} from '../../data-access/payments.models';
import { MyPaymentsPageComponent } from './my-payments-page.component';

function paginatedPayments(
  data: PaymentHistoryItem[],
  overrides: Partial<PaginatedResponse<PaymentHistoryItem>['meta']> = {},
): PaginatedResponse<PaymentHistoryItem> {
  return {
    data,
    links: {
      first: 'http://localhost/api/v1/me/payments?page=1',
      last: 'http://localhost/api/v1/me/payments?page=1',
      prev: null,
      next: null,
    },
    meta: {
      current_page: 1,
      from: data.length > 0 ? 1 : null,
      last_page: 1,
      path: 'http://localhost/api/v1/me/payments',
      per_page: 10,
      to: data.length > 0 ? data.length : null,
      total: data.length,
      ...overrides,
    },
  };
}

const confirmedPaymentOperation: PaymentHistoryItem = {
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
  provider_payment_id: 'paypal-payment-1',
  paid_at: '2026-06-20 18:39:43',
  failed_at: null,
  cancelled_at: null,
  created_at: '2026-06-20 18:39:43',
  failure_reason: null,
  can_retry: false,
  booking: {
    id: 'booking-1',
    status: 'paid',
    starts_at: '2026-06-25 10:00:00',
    ends_at: '2026-06-25 11:00:00',
    service_id: 'service-1',
    service: {
      id: 'service-1',
      name: 'Consulta',
    },
  },
  package_product: null,
  client_package: null,
};

const rejectedOperation: PaymentHistoryItem = {
  id: 'intent:intent-rejected',
  source: 'payment_intent',
  payment_id: null,
  payment_intent_id: 'intent-rejected',
  booking_id: 'booking-1',
  package_product_id: null,
  provider: 'mercadopago',
  status: 'rejected',
  display_status: 'rejected',
  amount: 1800,
  currency: 'UYU',
  provider_reference: 'preference-1',
  provider_payment_id: null,
  paid_at: null,
  failed_at: '2026-06-20 18:40:00',
  cancelled_at: null,
  created_at: '2026-06-20 18:39:43',
  failure_reason: 'La tarjeta fue rechazada.',
  can_retry: true,
  booking: {
    id: 'booking-1',
    status: 'confirmed',
    starts_at: '2026-06-25 10:00:00',
    ends_at: '2026-06-25 11:00:00',
    service_id: 'service-1',
    service: {
      id: 'service-1',
      name: 'Consulta',
    },
  },
  package_product: null,
  client_package: null,
};

const notConfirmedOperation: PaymentHistoryItem = {
  ...rejectedOperation,
  id: 'intent:intent-not-confirmed',
  payment_intent_id: 'intent-not-confirmed',
  status: 'checkout_created',
  display_status: 'not_confirmed',
  paid_at: null,
  failed_at: null,
  cancelled_at: null,
  failure_reason: null,
  can_retry: false,
};

describe('MyPaymentsPageComponent', () => {
  const api = {
    getMyPayments: vi.fn(),
  };

  beforeEach(async () => {
    api.getMyPayments.mockReset();

    await TestBed.configureTestingModule({
      imports: [MyPaymentsPageComponent],
      providers: [
        provideRouter([]),
        { provide: PaymentsApi, useValue: api },
      ],
    }).compileComponents();
  });

  it('loads and shows only confirmed payments returned by the payments endpoint', () => {
    api.getMyPayments.mockReturnValue(
      of(paginatedPayments([confirmedPaymentOperation])),
    );

    const fixture = TestBed.createComponent(MyPaymentsPageComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    expect(api.getMyPayments).toHaveBeenCalledWith(1, 10);
    expect(host.textContent).toContain('Consulta');
    expect(host.textContent).toContain('Fecha de pago');
    expect(host.textContent).toContain('Ver detalle');
    expect(host.querySelector('a[href="/my-payments/payment:payment-1"]')).not.toBeNull();
    expect(host.textContent).not.toContain('Continuar pago');
    expect(host.textContent).not.toContain('Reintentar pago');
    expect(host.textContent).not.toContain('Pagar ahora');
  });

  it('shows the payment-history empty state when the endpoint returns no operations', () => {
    api.getMyPayments.mockReturnValue(of(paginatedPayments([])));

    const fixture = TestBed.createComponent(MyPaymentsPageComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    expect(api.getMyPayments).toHaveBeenCalledWith(1, 10);
    expect(host.textContent).toContain('Todavía no tenés operaciones de pago.');
    expect(host.textContent).toContain(
      'Cuando pagues, rechaces o intentes pagar una reserva, aparecerá acá.',
    );
  });

  it('shows rejected and not-confirmed operations with their distinct badges', () => {
    api.getMyPayments.mockReturnValue(
      of(paginatedPayments([
        rejectedOperation,
        notConfirmedOperation,
      ])),
    );

    const fixture = TestBed.createComponent(MyPaymentsPageComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    expect(api.getMyPayments).toHaveBeenCalledWith(1, 10);
    expect(host.textContent).toContain('Rechazado');
    expect(host.textContent).toContain('No confirmado');
    expect(host.textContent).toContain('Fecha del intento');
    expect(host.textContent).toContain('La tarjeta fue rechazada.');
    expect(host.textContent).not.toContain('Pagado');

    expect(host.querySelector('a[href="/my-bookings/booking-1"]')).not.toBeNull();
    expect(host.querySelector('a[href="/my-bookings/booking-1"]')?.textContent).toContain(
      'Ver reserva',
    );

    expect(
      host.querySelector('a[href="/my-payments/intent:intent-rejected"]'),
    ).not.toBeNull();

    expect(host.textContent).toContain('Intentar nuevamente');
  });

  it('does not show retry for a rejected operation linked to a cancelled booking', () => {
    api.getMyPayments.mockReturnValue(
      of(paginatedPayments([
        {
          ...rejectedOperation,
          booking: {
            ...rejectedOperation.booking!,
            status: 'cancelled',
          },
        },
      ])),
    );

    const fixture = TestBed.createComponent(MyPaymentsPageComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    expect(api.getMyPayments).toHaveBeenCalledWith(1, 10);
    expect(host.textContent).not.toContain('Intentar nuevamente');
  });
});
