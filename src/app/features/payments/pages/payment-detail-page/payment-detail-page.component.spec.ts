import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { PaymentsApi } from '../../data-access/payments.api';
import {
  Payment,
  PaymentDetail,
  PaymentHistoryItem,
  PaymentIntent,
} from '../../data-access/payments.models';
import { PaymentDetailPageComponent } from './payment-detail-page.component';

const payment: Payment = {
  id: 'payment-1',
  payment_intent_id: 'intent-success',
  booking_id: 'booking-1',
  package_product_id: null,
  client_package_id: null,
  client_id: 'client-1',
  professional_id: 'professional-1',
  provider: 'paypal',
  status: 'succeeded',
  amount: 1800,
  currency: 'UYU',
  provider_reference: '5GP76217KU6931916',
  provider_payment_id: '8LB81893HJ324133N',
  metadata: null,
  paid_at: '2026-06-20 18:39:43',
  failed_at: null,
  refunded_at: null,
  failure_reason: null,
  created_at: '2026-06-20 18:39:43',
  updated_at: '2026-06-20 18:39:43',
};

const successfulIntent: PaymentIntent = {
  id: 'intent-success',
  payable_type: 'booking',
  payable_id: 'booking-1',
  booking_id: 'booking-1',
  package_product_id: null,
  client_id: 'client-1',
  professional_id: 'professional-1',
  provider: 'paypal',
  status: 'succeeded',
  amount: 1800,
  currency: 'UYU',
  checkout_url: null,
  provider_reference: '5GP76217KU6931916',
  metadata: null,
  expires_at: null,
  processing_at: null,
  succeeded_at: '2026-06-20 18:39:43',
  failed_at: null,
  cancelled_at: null,
  failure_reason: null,
  created_at: '2026-06-20 18:39:43',
  updated_at: '2026-06-20 18:39:43',
};

const operation: PaymentHistoryItem = {
  id: 'payment-1',
  source: 'payment',
  payment_id: 'payment-1',
  payment_intent_id: 'intent-success',
  booking_id: 'booking-1',
  package_product_id: null,
  provider: 'paypal',
  status: 'succeeded',
  amount: 1800,
  currency: 'UYU',
  provider_reference: '5GP76217KU6931916',
  provider_payment_id: '8LB81893HJ324133N',
  paid_at: '2026-06-20 18:39:43',
  failed_at: null,
  cancelled_at: null,
  created_at: '2026-06-20 18:39:43',
  failure_reason: null,
};

const detail: PaymentDetail = {
  source: 'payment',
  operation,
  payment,
  payment_intent: successfulIntent,
  booking: {
    id: 'booking-1',
    status: 'cancelled',
    starts_at: '2026-06-25 10:00:00',
    ends_at: '2026-06-25 11:00:00',
    service_id: 'service-1',
  },
  package_product: null,
  successful_intent: successfulIntent,
  related_attempts: [
    successfulIntent,
    {
      ...successfulIntent,
      id: 'intent-expired',
      provider: 'mercadopago',
      status: 'expired',
      provider_reference: 'mp-preference-1',
      succeeded_at: null,
    },
  ],
};

describe('PaymentDetailPageComponent', () => {
  const api = {
    getMyPayment: vi.fn(),
  };

  beforeEach(async () => {
    api.getMyPayment.mockReset();

    await TestBed.configureTestingModule({
      imports: [PaymentDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: PaymentsApi, useValue: api },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ paymentId: 'payment-1' })) } },
      ],
    }).compileComponents();
  });

  it('shows payment data, provider identifiers, and the linked booking', () => {
    api.getMyPayment.mockReturnValue(of(detail));

    const fixture = TestBed.createComponent(PaymentDetailPageComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(api.getMyPayment).toHaveBeenCalledWith('payment-1');
    expect(host.textContent).toContain('PayPal');
    expect(host.textContent).toContain('8LB81893HJ324133N');
    expect(host.textContent).toContain('Esta reserva está cancelada, pero el pago fue registrado correctamente.');
    expect(host.querySelector('a[href="/my-bookings/booking-1"]')).not.toBeNull();
    expect(host.textContent).not.toContain('Continuar pago');
    expect(host.textContent).not.toContain('Reintentar pago');
  });

  it('shows the successful attempt and all related attempts', () => {
    api.getMyPayment.mockReturnValue(of(detail));

    const fixture = TestBed.createComponent(PaymentDetailPageComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Intento exitoso relacionado');
    expect(host.textContent).toContain('Historial de intentos relacionados');
    expect(host.textContent).toContain('5GP76217KU6931916');
    expect(host.textContent).toContain('mp-preference-1');
  });
});
