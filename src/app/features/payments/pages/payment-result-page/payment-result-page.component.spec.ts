import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { PaymentsApi } from '../../data-access/payments.api';
import {
  PaymentIntent,
  PaymentIntentStatus,
  PaymentStatusResult,
} from '../../data-access/payments.models';
import { PaymentRedirectService } from '../../services/payment-redirect.service';
import { PaymentResultPageComponent } from './payment-result-page.component';

const baseIntent: PaymentIntent = {
  id: 'intent-1',
  payable_type: 'booking',
  payable_id: 'booking-1',
  booking_id: 'booking-1',
  package_product_id: null,
  client_id: null,
  professional_id: null,
  provider: 'paypal',
  status: 'checkout_created',
  amount: 1800,
  currency: 'UYU',
  checkout_url: null,
  provider_reference: 'paypal-order-1',
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

function statusResult(status: PaymentIntentStatus): PaymentStatusResult {
  return {
    payment_intent: {
      ...baseIntent,
      status,
    },
    payment: null,
  };
}

describe('PaymentResultPageComponent', () => {
  const api = {
    getPaymentStatus: vi.fn(),
  };
  const redirectService = {
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    api.getPaymentStatus.mockReset();
    redirectService.clear.mockReset();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.clear();
    vi.useRealTimers();
  });

  async function createFixture(queryParams: Record<string, string> = {}) {
    await TestBed.configureTestingModule({
      imports: [PaymentResultPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap(queryParams),
            },
          },
        },
        { provide: PaymentsApi, useValue: api },
        { provide: PaymentRedirectService, useValue: redirectService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PaymentResultPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('does not poll without payment_intent_id and shows a PayPal token reference', async () => {
    const fixture = await createFixture({ token: 'paypal-token-1' });
    await vi.advanceTimersByTimeAsync(30_000);
    fixture.detectChanges();

    expect(api.getPaymentStatus).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'falta el identificador interno del pago',
    );
    expect(fixture.nativeElement.textContent).toContain('paypal-token-1');
  });

  it.each([
    ['token', 'paypal-token-1'],
    ['PayerID', 'paypal-payer-1'],
  ] as const)('starts provider-return polling for query param %s', async (key, value) => {
    api.getPaymentStatus.mockReturnValue(of(statusResult('checkout_created')));
    const fixture = await createFixture({
      payment_intent_id: 'intent-1',
      [key]: value,
    });

    await vi.advanceTimersByTimeAsync(3_000);
    fixture.detectChanges();

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.polling()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(
      'Estamos confirmando tu pago',
    );
  });

  it('performs one request when the page was not opened by a provider return', async () => {
    api.getPaymentStatus.mockReturnValue(of(statusResult('checkout_created')));
    const fixture = await createFixture({ payment_intent_id: 'intent-1' });

    await vi.advanceTimersByTimeAsync(60_000);
    fixture.detectChanges();

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.polling()).toBe(false);
  });

  it('keeps polling stale PayPal state and confirms automatically after the webhook', async () => {
    api.getPaymentStatus
      .mockReturnValueOnce(
        of({
          ...statusResult('checkout_created'),
          payment_intent: {
            ...baseIntent,
            status: 'checkout_created',
            metadata: {
              external_status: 'PAYER_ACTION_REQUIRED',
            },
          },
        }),
      )
      .mockReturnValueOnce(of(statusResult('succeeded')));
    const fixture = await createFixture({
      payment_intent_id: 'intent-1',
      token: 'paypal-token-1',
    });

    await vi.advanceTimersByTimeAsync(3_000);
    await vi.advanceTimersByTimeAsync(30_000);
    fixture.detectChanges();

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.status()).toBe('succeeded');
    expect(fixture.componentInstance.polling()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Pago confirmado');
  });

  it.each<PaymentIntentStatus>(['succeeded', 'failed', 'cancelled', 'expired'])(
    'stops after one request when status is %s',
    async (status) => {
      api.getPaymentStatus.mockReturnValue(of(statusResult(status)));
      const fixture = await createFixture({
        paymentIntentId: 'intent-1',
        token: 'paypal-token-1',
      });

      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(30_000);

      expect(api.getPaymentStatus).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.status()).toBe(status);
      expect(fixture.componentInstance.polling()).toBe(false);
    },
  );

  it('does not start a second polling loop', async () => {
    api.getPaymentStatus.mockReturnValue(of(statusResult('processing')));
    const fixture = await createFixture({
      payment_intent_id: 'intent-1',
      token: 'paypal-token-1',
    });

    fixture.componentInstance.ngOnInit();
    await vi.advanceTimersByTimeAsync(0);

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(1);
  });

  it('manual refresh performs exactly one request', async () => {
    api.getPaymentStatus.mockReturnValue(of(statusResult('checkout_created')));
    const fixture = await createFixture({ payment_intent_id: 'intent-1' });

    api.getPaymentStatus.mockClear();
    api.getPaymentStatus.mockReturnValue(of(statusResult('succeeded')));
    fixture.componentInstance.refresh();

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.status()).toBe('succeeded');
  });

  it('uses one status request instead of restarting polling after a recent route visit', async () => {
    window.sessionStorage.setItem(
      'payment-provider-return-polled:intent-1',
      String(Date.now()),
    );
    api.getPaymentStatus.mockReturnValue(of(statusResult('checkout_created')));

    const fixture = await createFixture({
      payment_intent_id: 'intent-1',
      token: 'paypal-token-1',
    });
    await vi.advanceTimersByTimeAsync(60_000);
    fixture.detectChanges();

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.polling()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain(
      'Podes actualizar el estado manualmente',
    );
  });

  it('makes at most 20 provider-return requests and then shows pending confirmation', async () => {
    api.getPaymentStatus.mockReturnValue(of(statusResult('checkout_created')));
    const fixture = await createFixture({
      payment_intent_id: 'intent-1',
      payment_id: 'mercadopago-payment-1',
    });

    await vi.advanceTimersByTimeAsync(60_000);
    fixture.detectChanges();

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(20);
    expect(fixture.componentInstance.polling()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain(
      'El proveedor puede demorar unos segundos mas',
    );
  });

  it('stops polling immediately on 429 and shows a friendly message', async () => {
    api.getPaymentStatus.mockReturnValue(
      throwError(
        () =>
          new ApiClientError(
            'Demasiadas solicitudes.',
            429,
            'TooManyRequests',
          ),
      ),
    );
    const fixture = await createFixture({
      payment_intent_id: 'intent-1',
      token: 'paypal-token-1',
    });

    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(30_000);
    fixture.detectChanges();

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.polling()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain(
      'Se realizaron demasiadas consultas',
    );
  });

  it('cancels polling when the component is destroyed', async () => {
    api.getPaymentStatus.mockReturnValue(of(statusResult('checkout_created')));
    const fixture = await createFixture({
      payment_intent_id: 'intent-1',
      token: 'paypal-token-1',
    });

    await vi.advanceTimersByTimeAsync(0);
    expect(api.getPaymentStatus).toHaveBeenCalledTimes(1);

    fixture.destroy();
    await vi.advanceTimersByTimeAsync(30_000);

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(1);
  });
});
