import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PaymentsApi } from '../../data-access/payments.api';
import {
  Payment,
  PaymentIntent,
  PaymentStatusResult,
} from '../../data-access/payments.models';
import { SimulatedCheckoutPanelComponent } from './simulated-checkout-panel.component';

const intent: PaymentIntent = {
  id: 'intent-1',
  payable_type: 'booking',
  payable_id: 'booking-1',
  booking_id: 'booking-1',
  package_product_id: null,
  client_id: 'client-1',
  professional_id: 'professional-1',
  provider: 'simulator',
  status: 'checkout_created',
  amount: 1800,
  currency: 'UYU',
  checkout_url: null,
  provider_reference: 'sim_intent-1',
  metadata: {},
  expires_at: null,
  processing_at: null,
  succeeded_at: null,
  failed_at: null,
  cancelled_at: null,
  failure_reason: null,
  created_at: null,
  updated_at: null,
};

const payment: Payment = {
  id: 'payment-1',
  payment_intent_id: 'intent-1',
  booking_id: 'booking-1',
  package_product_id: null,
  client_package_id: null,
  client_id: 'client-1',
  professional_id: 'professional-1',
  provider: 'simulator',
  status: 'succeeded',
  amount: 1800,
  currency: 'UYU',
  provider_reference: 'sim_payment-1',
  metadata: {},
  paid_at: '2026-06-12T12:05:00Z',
  failed_at: null,
  refunded_at: null,
  failure_reason: null,
  created_at: null,
  updated_at: null,
};

const successResult: PaymentStatusResult = {
  payment_intent: { ...intent, status: 'succeeded', payment },
  payment,
};

const failureResult: PaymentStatusResult = {
  payment_intent: {
    ...intent,
    status: 'failed',
    failure_reason: 'Pago simulado rechazado.',
  },
  payment: null,
};

describe('SimulatedCheckoutPanelComponent', () => {
  const api = {
    simulateSuccess: vi.fn(() => of(successResult)),
    simulateFailure: vi.fn(() => of(failureResult)),
  };

  beforeEach(async () => {
    api.simulateSuccess.mockClear();
    api.simulateFailure.mockClear();

    await TestBed.configureTestingModule({
      imports: [SimulatedCheckoutPanelComponent],
      providers: [{ provide: PaymentsApi, useValue: api }],
    }).compileComponents();
  });

  it('emits the updated status after success simulation', () => {
    const fixture = TestBed.createComponent(SimulatedCheckoutPanelComponent);
    let emittedResult: PaymentStatusResult | null = null;

    fixture.componentRef.setInput('paymentIntent', intent);
    fixture.componentInstance.statusChanged.subscribe((value) => {
      emittedResult = value;
    });
    fixture.detectChanges();

    fixture.componentInstance.simulateSuccess();

    expect(api.simulateSuccess).toHaveBeenCalledWith('intent-1');
    expect(emittedResult).toEqual(successResult);
  });

  it('sends a failure reason and emits the failed status', () => {
    const fixture = TestBed.createComponent(SimulatedCheckoutPanelComponent);
    let emittedResult: PaymentStatusResult | null = null;

    fixture.componentRef.setInput('paymentIntent', intent);
    fixture.componentInstance.statusChanged.subscribe((value) => {
      emittedResult = value;
    });
    fixture.detectChanges();

    fixture.componentInstance.simulateFailure();

    expect(api.simulateFailure).toHaveBeenCalledWith('intent-1', {
      failure_reason: 'Pago simulado rechazado.',
    });
    expect(emittedResult).toEqual(failureResult);
  });
});
