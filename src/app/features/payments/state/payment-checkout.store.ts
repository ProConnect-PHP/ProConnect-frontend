import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, of, switchMap, tap } from 'rxjs';

import { PaymentsApi } from '../data-access/payments.api';
import { mapPaymentApiError } from '../data-access/payments-error.mapper';
import {
  PayableType,
  PaymentIntent,
  PaymentIntentStatus,
  PaymentProvider,
  PaymentStatusResult,
} from '../data-access/payments.models';
import { PaymentRedirectService } from '../services/payment-redirect.service';

@Injectable()
export class PaymentCheckoutStore {
  private readonly api = inject(PaymentsApi);
  private readonly redirectService = inject(PaymentRedirectService);

  readonly selectedProvider = signal<PaymentProvider>('mercadopago');
  readonly paymentIntent = signal<PaymentIntent | null>(null);
  readonly payment = signal<PaymentStatusResult['payment']>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly status = computed<PaymentIntentStatus | null>(
    () => this.paymentIntent()?.status ?? null,
  );
  readonly checkoutUrl = computed(() => this.paymentIntent()?.checkout_url ?? null);
  readonly simulatorReady = computed(
    () => this.selectedProvider() === 'simulator' && !!this.paymentIntent(),
  );
  readonly canCheckout = computed(() => {
    if (this.loading()) return false;

    const status = this.status();
    return (
      !status ||
      status === 'pending' ||
      status === 'checkout_created' ||
      status === 'failed' ||
      status === 'cancelled' ||
      status === 'expired'
    );
  });

  selectProvider(provider: PaymentProvider): void {
    if (provider === this.selectedProvider()) return;

    this.selectedProvider.set(provider);
    this.paymentIntent.set(null);
    this.payment.set(null);
    this.error.set(null);
  }

  startCheckout(payableType: PayableType, payableId: string): void {
    if (!this.canCheckout()) return;

    const provider = this.selectedProvider();
    this.loading.set(true);
    this.error.set(null);
    this.payment.set(null);

    this.intentForCheckout(payableType, payableId, provider)
      .pipe(
        tap((paymentIntent) => this.paymentIntent.set(paymentIntent)),
        switchMap((paymentIntent) =>
          this.api.createCheckout(paymentIntent.id, { provider }),
        ),
        tap((paymentIntent) => {
          this.paymentIntent.set(paymentIntent);
          this.redirectService.remember(paymentIntent);

          if (provider === 'simulator') return;

          if (paymentIntent.checkout_url) {
            this.redirectService.redirectToCheckout(paymentIntent.checkout_url);
            return;
          }

          this.error.set('No se pudo obtener la URL de pago.');
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        error: (error: unknown) => {
          this.error.set(mapPaymentApiError(error, 'No pudimos iniciar el pago.'));
        },
      });
  }

  applyStatus(result: PaymentStatusResult): void {
    this.paymentIntent.set(result.payment_intent);
    this.payment.set(result.payment);
    this.error.set(
      result.payment_intent.status === 'failed'
        ? result.payment_intent.failure_reason ?? 'El pago fue rechazado por el proveedor.'
        : null,
    );
  }

  private intentForCheckout(
    payableType: PayableType,
    payableId: string,
    provider: PaymentProvider,
  ): Observable<PaymentIntent> {
    const current = this.paymentIntent();
    const reusableStatuses: PaymentIntentStatus[] = ['pending', 'checkout_created'];

    if (
      current &&
      current.payable_type === payableType &&
      current.payable_id === payableId &&
      current.provider === provider &&
      reusableStatuses.includes(current.status)
    ) {
      return of(current);
    }

    return this.api.createPaymentIntent({
      payable_type: payableType,
      payable_id: payableId,
      provider,
    });
  }
}
