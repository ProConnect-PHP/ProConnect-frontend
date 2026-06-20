import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ApiClientError } from '../../../core/http/models/api-error.model';
import { PaymentsApi } from '../data-access/payments.api';
import {
  PaymentIntent,
  PaymentIntentStatus,
  PaymentStatusResult,
} from '../data-access/payments.models';
import {
  PaymentPollingEvent,
  PaymentStatusPollerService,
} from './payment-status-poller.service';

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

function statusResult(
  status: PaymentIntentStatus,
  metadata: Record<string, unknown> | null = null,
  nextPollAfterSeconds: number | null = null,
): PaymentStatusResult {
  return {
    payment_intent: {
      ...baseIntent,
      status,
      metadata,
      next_poll_after_seconds: nextPollAfterSeconds,
    },
    payment: null,
  };
}

describe('PaymentStatusPollerService', () => {
  const api = {
    getPaymentStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    api.getPaymentStatus.mockReset();

    TestBed.configureTestingModule({
      providers: [
        PaymentStatusPollerService,
        { provide: PaymentsApi, useValue: api },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('shares one active poll for the same payment intent', async () => {
    api.getPaymentStatus.mockReturnValue(of(statusResult('processing')));
    const poller = TestBed.inject(PaymentStatusPollerService);

    const firstPoll = poller.pollProviderReturn('intent-1');
    const secondPoll = poller.pollProviderReturn('intent-1');

    expect(secondPoll).toBe(firstPoll);
    firstPoll.subscribe();
    secondPoll.subscribe();

    await vi.advanceTimersByTimeAsync(3_000);

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(2);
  });

  it('fetches the status once without starting polling', async () => {
    api.getPaymentStatus.mockReturnValue(of(statusResult('checkout_created')));
    const poller = TestBed.inject(PaymentStatusPollerService);

    poller.fetchOnce('intent-1').subscribe();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(1);
  });

  it('keeps polling after stale PayPal payer action and stops on success', async () => {
    api.getPaymentStatus
      .mockReturnValueOnce(
        of(
          statusResult('checkout_created', {
            external_status: 'PAYER_ACTION_REQUIRED',
          }),
        ),
      )
      .mockReturnValueOnce(of(statusResult('succeeded')));
    const poller = TestBed.inject(PaymentStatusPollerService);
    const events: PaymentPollingEvent[] = [];

    poller
      .pollProviderReturn('intent-1')
      .subscribe((event) => events.push(event));
    await vi.advanceTimersByTimeAsync(3_000);
    await vi.advanceTimersByTimeAsync(60_000);

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(2);
    expect(events).toEqual([
      expect.objectContaining({
        type: 'result',
        attempt: 1,
        done: false,
        reason: null,
      }),
      expect.objectContaining({
        type: 'result',
        attempt: 2,
        done: true,
        reason: 'terminal',
      }),
    ]);
  });

  it('does not treat PAYER_ACTION_REQUIRED as terminal during provider return', async () => {
    api.getPaymentStatus.mockReturnValue(
      of(
        statusResult('checkout_created', {
          external_status: 'PAYER_ACTION_REQUIRED',
        }),
      ),
    );
    const poller = TestBed.inject(PaymentStatusPollerService);
    const events: PaymentPollingEvent[] = [];

    poller
      .pollProviderReturn('intent-1')
      .subscribe((event) => events.push(event));
    await vi.advanceTimersByTimeAsync(3_000);

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(2);
    expect(events.at(-1)).toMatchObject({
      type: 'result',
      attempt: 2,
      done: false,
      reason: null,
    });
  });

  it.each<PaymentIntentStatus>([
    'paid',
    'succeeded',
    'completed',
    'failed',
    'denied',
    'cancelled',
    'expired',
  ])(
    'stops after one request for terminal status %s',
    async (status) => {
      api.getPaymentStatus.mockReturnValue(of(statusResult(status)));
      const poller = TestBed.inject(PaymentStatusPollerService);

      poller.pollProviderReturn('intent-1').subscribe();
      await vi.advanceTimersByTimeAsync(30_000);

      expect(api.getPaymentStatus).toHaveBeenCalledTimes(1);
    },
  );

  it('uses the bounded backoff sequence and stops after eight provider-return attempts', async () => {
    api.getPaymentStatus.mockReturnValue(of(statusResult('checkout_created')));
    const poller = TestBed.inject(PaymentStatusPollerService);
    const events: PaymentPollingEvent[] = [];

    poller
      .pollProviderReturn('intent-1')
      .subscribe((event) => events.push(event));
    await vi.advanceTimersByTimeAsync(61_000);

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(8);
    expect(events.at(-1)).toMatchObject({
      type: 'result',
      attempt: 8,
      done: true,
      reason: 'max_attempts',
    });
  });

  it('respects next_poll_after_seconds from the backend', async () => {
    api.getPaymentStatus.mockReturnValue(of(statusResult('processing', null, 12)));
    const poller = TestBed.inject(PaymentStatusPollerService);

    poller.pollProviderReturn('intent-1').subscribe();
    await vi.advanceTimersByTimeAsync(11_999);

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(2);
  });

  it('stops immediately on rate limiting', async () => {
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
    const poller = TestBed.inject(PaymentStatusPollerService);
    const events: PaymentPollingEvent[] = [];

    poller
      .pollProviderReturn('intent-1')
      .subscribe((event) => events.push(event));
    await vi.advanceTimersByTimeAsync(30_000);

    expect(api.getPaymentStatus).toHaveBeenCalledTimes(1);
    expect(events).toEqual([
      expect.objectContaining({
        type: 'error',
        attempt: 1,
        reason: 'rate_limited',
      }),
    ]);
  });
});
