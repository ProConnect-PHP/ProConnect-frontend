import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Observable,
  catchError,
  defer,
  exhaustMap,
  finalize,
  map,
  of,
  shareReplay,
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
  'succeeded',
  'failed',
  'cancelled',
  'expired',
];

export const PROVIDER_RETURN_POLLING_INTERVAL_MS = 3_000;
export const PROVIDER_RETURN_MAX_ATTEMPTS = 20;

export type PaymentPollingEvent =
  | {
      type: 'result';
      result: PaymentStatusResult;
      attempt: number;
      done: boolean;
      reason: 'terminal' | 'max_attempts' | null;
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
      let attempts = 0;

      return timer(0, PROVIDER_RETURN_POLLING_INTERVAL_MS).pipe(
        exhaustMap(() => {
          attempts += 1;

          return this.api.getPaymentStatus(paymentIntentId).pipe(
            map((result): PaymentPollingEvent => {
              const status = result.payment_intent.status;
              const isTerminal = TERMINAL_PAYMENT_INTENT_STATUSES.includes(status);
              const maxReached = attempts >= PROVIDER_RETURN_MAX_ATTEMPTS;

              return {
                type: 'result',
                result,
                attempt: attempts,
                done: isTerminal || maxReached,
                reason: isTerminal
                  ? 'terminal'
                  : maxReached
                    ? 'max_attempts'
                    : null,
              };
            }),
            catchError((error: unknown) =>
              of<PaymentPollingEvent>({
                type: 'error',
                error,
                attempt: attempts,
                done: true,
                reason:
                  error instanceof ApiClientError && error.status === 429
                    ? 'rate_limited'
                    : 'request_failed',
              }),
            ),
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
}

export function isPaypalPayerActionRequired(result: PaymentStatusResult): boolean {
  return (
    result.payment_intent.provider === 'paypal' &&
    result.payment_intent.status === 'checkout_created' &&
    result.payment_intent.metadata?.['external_status'] === 'PAYER_ACTION_REQUIRED'
  );
}
