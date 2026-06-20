import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PaymentMovement } from '../../data-access/payments.models';
import { PaymentMovementsListComponent } from './payment-movements-list.component';

const checkoutMovement: PaymentMovement = {
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
  provider_status: null,
  checkout_url: 'https://paypal.test/checkout',
  booking: { id: 'booking-1', status: 'pending', starts_at: null },
  package_product: null,
  client_package: null,
  payment_intent_id: null,
  created_at: null,
  updated_at: null,
  paid_at: null,
  failed_at: null,
  expires_at: null,
  next_poll_after_seconds: null,
};

describe('PaymentMovementsListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentMovementsListComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders a checkout-created payment intent with only its permitted actions', () => {
    const fixture = TestBed.createComponent(PaymentMovementsListComponent);
    fixture.componentRef.setInput('payments', [checkoutMovement]);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Checkout creado');
    expect(host.textContent).toContain('Continuar pago');
    expect(host.textContent).toContain('Actualizar estado');
    expect(host.textContent).not.toContain('Reintentar pago');
  });

  it('renders the filtered empty state', () => {
    const fixture = TestBed.createComponent(PaymentMovementsListComponent);
    fixture.componentRef.setInput('payments', []);
    fixture.componentRef.setInput('hasActiveFilters', true);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No encontramos pagos con esos filtros.',
    );
  });
});
