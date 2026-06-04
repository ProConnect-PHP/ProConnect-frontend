import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PaymentsApi } from '../../data-access/payments.api';
import { Payment, PaymentIntent } from '../../data-access/payments.models';
import { SimulatedCheckoutPanelComponent } from './simulated-checkout-panel.component';

const intent: PaymentIntent = {
  id: 'intent-1',
  booking_id: 'booking-1',
  client_id: 'client-1',
  professional_id: 'professional-1',
  provider: 'simulator',
  status: 'pending',
  amount: 1800,
  currency: 'UYU',
  provider_reference: 'sim_intent-1',
  metadata: {},
  expires_at: null,
  processing_at: null,
  succeeded_at: null,
  failed_at: null,
  cancelled_at: null,
  failure_reason: null,
  created_at: null,
};

const payment: Payment = {
  id: 'payment-1',
  payment_intent_id: 'intent-1',
  booking_id: 'booking-1',
  client_id: 'client-1',
  professional_id: 'professional-1',
  provider: 'simulator',
  status: 'succeeded',
  amount: 1800,
  currency: 'UYU',
  provider_reference: 'sim_payment-1',
  metadata: {},
  paid_at: '2026-06-01 12:05:00',
  failed_at: null,
  refunded_at: null,
  failure_reason: null,
  created_at: null,
};

const failedIntent: PaymentIntent = {
  ...intent,
  status: 'failed',
  failure_reason: 'Tarjeta simulada rechazada.',
};

describe('SimulatedCheckoutPanelComponent', () => {
  const api = {
    createPaymentIntent: vi.fn(() => of(intent)),
    simulateSuccess: vi.fn(() => of(payment)),
    simulateFailure: vi.fn(() => of(failedIntent)),
  };

  beforeEach(async () => {
    api.createPaymentIntent.mockClear();
    api.simulateSuccess.mockClear();
    api.simulateFailure.mockClear();

    await TestBed.configureTestingModule({
      imports: [SimulatedCheckoutPanelComponent],
      providers: [{ provide: PaymentsApi, useValue: api }],
    }).compileComponents();
  });

  it('emits paymentSucceeded after success simulation', () => {
    const fixture = TestBed.createComponent(SimulatedCheckoutPanelComponent);
    let emittedPayment: Payment | null = null;

    fixture.componentRef.setInput('bookingId', 'booking-1');
    fixture.componentRef.setInput('existingIntent', intent);
    fixture.componentInstance.paymentSucceeded.subscribe((value) => {
      emittedPayment = value;
    });
    fixture.detectChanges();

    fixture.componentInstance.simulateSuccess();

    expect(api.simulateSuccess).toHaveBeenCalledWith('intent-1');
    expect(emittedPayment).toEqual(payment);
  });

  it('emits paymentFailed after failure simulation', () => {
    const fixture = TestBed.createComponent(SimulatedCheckoutPanelComponent);
    let emittedIntent: PaymentIntent | null = null;

    fixture.componentRef.setInput('bookingId', 'booking-1');
    fixture.componentRef.setInput('existingIntent', intent);
    fixture.componentInstance.paymentFailed.subscribe((value) => {
      emittedIntent = value;
    });
    fixture.detectChanges();

    fixture.componentInstance.simulateFailure();

    expect(api.simulateFailure).toHaveBeenCalledWith('intent-1', {
      failure_reason: 'Tarjeta simulada rechazada.',
    });
    expect(emittedIntent).toEqual(failedIntent);
  });
});
