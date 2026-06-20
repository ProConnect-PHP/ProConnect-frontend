import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { PaymentsApi } from '../../data-access/payments.api';
import { Payment } from '../../data-access/payments.models';
import { MyPaymentsPageComponent } from './my-payments-page.component';

const payment: Payment = {
  id: 'payment-1',
  payment_intent_id: 'intent-1',
  booking_id: 'booking-1',
  package_product_id: null,
  client_package_id: null,
  client_id: 'client-1',
  professional_id: 'professional-1',
  provider: 'paypal',
  status: 'succeeded',
  amount: 1800,
  currency: 'UYU',
  provider_reference: 'paypal-order-1',
  provider_payment_id: 'paypal-payment-1',
  metadata: null,
  paid_at: '2026-06-20 18:39:43',
  failed_at: null,
  refunded_at: null,
  failure_reason: null,
  booking: {
    id: 'booking-1',
    status: 'paid',
    starts_at: '2026-06-25 10:00:00',
    ends_at: '2026-06-25 11:00:00',
    service_id: 'service-1',
    service: { id: 'service-1', name: 'Consulta' },
  },
  created_at: '2026-06-20 18:39:43',
  updated_at: '2026-06-20 18:39:43',
};

describe('MyPaymentsPageComponent', () => {
  const api = {
    getMyPayments: vi.fn(),
  };

  beforeEach(async () => {
    api.getMyPayments.mockReset();

    await TestBed.configureTestingModule({
      imports: [MyPaymentsPageComponent],
      providers: [provideRouter([]), { provide: PaymentsApi, useValue: api }],
    }).compileComponents();
  });

  it('loads and shows only confirmed payments returned by the payments endpoint', () => {
    api.getMyPayments.mockReturnValue(of([payment]));

    const fixture = TestBed.createComponent(MyPaymentsPageComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(api.getMyPayments).toHaveBeenCalledOnce();
    expect(host.textContent).toContain('Consulta');
    expect(host.textContent).toContain('Ver detalle');
    expect(host.querySelector('a[href="/my-payments/payment-1"]')).not.toBeNull();
    expect(host.textContent).not.toContain('Continuar pago');
    expect(host.textContent).not.toContain('Reintentar pago');
    expect(host.textContent).not.toContain('Pagar ahora');
  });

  it('shows the payment-history empty state when the endpoint returns no operations', () => {
    api.getMyPayments.mockReturnValue(of([]));

    const fixture = TestBed.createComponent(MyPaymentsPageComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Todavía no tenés operaciones de pago.');
    expect(host.textContent).toContain(
      'Los pagos confirmados y los intentos rechazados aparecerán acá.',
    );
  });
});
