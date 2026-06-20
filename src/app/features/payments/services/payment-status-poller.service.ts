import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Observable,
  EMPTY,
  catchError,
  defer,
  expand,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  takeWhile,
  timer,
} from 'rxjs';

import { ApiClientError } from '../../../core/http/models/api-error.model';
import { PaymentsApi } from '../data-access/payments.api';
import {
  PaymentIntentStatus,
  PaymentStatusResult,
} from '../data-access/payments.models';

const TERMINAL_PAYMENT_INTENT_STATUSES: PaymentIntentStatus[] = [
  'paid',
  'succeeded',
  'completed',
  'failed',
  'denied',
  'cancelled',
  'expired',
];

/** First request is immediate; these values delay each following request. */
export const PROVIDER_RETURN_POLLING_BACKOFF_MS = [
  3_000,
  3_000,
  5_000,
  5_000,
  10_000,
  15_000,
  20_000,
] as const;
export const PROVIDER_RETURN_MAX_ATTEMPTS = PROVIDER_RETURN_POLLING_BACKOFF_MS.length + 1;
export const PROVIDER_RETURN_MAX_DURATION_MS = 90_000;

export type PaymentPollingEvent =
  | {
      type: 'result';
      result: PaymentStatusResult;
      attempt: number;
      done: boolean;
      reason: 'terminal' | 'max_attempts' | 'max_duration' | null;
    }
  | {
      type: 'error';
      error: unknown;
      attempt: number;
      done: true;
      reason: 'rate_limited' | 'request_failed';
    };

@Injectable({ providedIn: 'root' })
export class PaymentStatusPollerService {
  private readonly api = inject(PaymentsApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly activePolls = new Map<string, Observable<PaymentPollingEvent>>();

  fetchOnce(paymentIntentId: string): Observable<PaymentStatusResult> {
    return this.api.getPaymentStatus(paymentIntentId);
  }

  pollProviderReturn(
    paymentIntentId: string,
  ): Observable<PaymentPollingEvent> {
    const activePoll = this.activePolls.get(paymentIntentId);
    if (activePoll) return activePoll;

    const poll = defer(() => {
      const startedAt = Date.now();

      return this.requestStatus(paymentIntentId, 1).pipe(
        expand((event) => {
          if (event.done) return EMPTY;

          const delay = this.nextDelay(event.result, event.attempt);
          const elapsed = Date.now() - startedAt;

          if (elapsed + delay > PROVIDER_RETURN_MAX_DURATION_MS) {
            return of<PaymentPollingEvent>({
              ...event,
              done: true,
              reason: 'max_duration',
            });
          }

          return timer(delay).pipe(
            switchMap(() => this.requestStatus(paymentIntentId, event.attempt + 1)),
          );
        }),
        takeWhile((event) => !event.done, true),
      );
    }).pipe(
      finalize(() => this.activePolls.delete(paymentIntentId)),
      takeUntilDestroyed(this.destroyRef),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.activePolls.set(paymentIntentId, poll);
    return poll;
  }

  private requestStatus(paymentIntentId: string, attempt: number): Observable<PaymentPollingEvent> {
    return this.api.getPaymentStatus(paymentIntentId).pipe(
      map((result): PaymentPollingEvent => {
        const status = result.payment_intent.status;
        const isTerminal = TERMINAL_PAYMENT_INTENT_STATUSES.includes(status);
        const maxReached = attempt >= PROVIDER_RETURN_MAX_ATTEMPTS;

        return {
          type: 'result',
          result,
          attempt,
          done: isTerminal || maxReached,
          reason: isTerminal ? 'terminal' : maxReached ? 'max_attempts' : null,
        };
      }),
      catchError((error: unknown) =>
        of<PaymentPollingEvent>({
          type: 'error',
          error,
          attempt,
          done: true,
          reason:
            error instanceof ApiClientError && error.status === 429
              ? 'rate_limited'
              : 'request_failed',
        }),
      ),
    );
  }

  private nextDelay(result: PaymentStatusResult, attempt: number): number {
    const serverDelay = result.next_poll_after_seconds ?? result.payment_intent.next_poll_after_seconds;
    if (typeof serverDelay === 'number' && Number.isFinite(serverDelay) && serverDelay > 0) {
      return serverDelay * 1_000;
    }

    return PROVIDER_RETURN_POLLING_BACKOFF_MS[attempt - 1] ?? 0;
  }
}

export function isPaypalPayerActionRequired(result: PaymentStatusResult): boolean {
  return (
    result.payment_intent.provider === 'paypal' &&
    result.payment_intent.status === 'checkout_created' &&
    result.payment_intent.metadata?.['external_status'] === 'PAYER_ACTION_REQUIRED'
  );
}
