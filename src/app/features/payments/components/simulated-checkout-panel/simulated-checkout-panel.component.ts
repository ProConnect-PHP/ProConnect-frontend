import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { PaymentsApi } from '../../data-access/payments.api';
import { mapPaymentApiError } from '../../data-access/payments-error.mapper';
import { Payment, PaymentIntent } from '../../data-access/payments.models';
import { PaymentSummaryCardComponent } from '../payment-summary-card/payment-summary-card.component';

@Component({
  selector: 'app-simulated-checkout-panel',
  imports: [PaymentSummaryCardComponent],
  templateUrl: './simulated-checkout-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatedCheckoutPanelComponent implements OnInit {
  private readonly api = inject(PaymentsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly bookingId = input.required<string>();
  readonly existingIntent = input<PaymentIntent | null>(null);

  readonly paymentSucceeded = output<Payment>();
  readonly paymentFailed = output<PaymentIntent>();
  readonly closed = output<void>();

  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly paymentIntent = signal<PaymentIntent | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successPayment = signal<Payment | null>(null);
  readonly failureReason = signal('Tarjeta simulada rechazada.');

  ngOnInit(): void {
    const existingIntent = this.existingIntent();
    if (existingIntent) {
      this.paymentIntent.set(existingIntent);
      return;
    }

    this.createIntent();
  }

  createIntent(): void {
    if (this.loading() || this.submitting()) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successPayment.set(null);

    this.api
      .createPaymentIntent(this.bookingId())
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (paymentIntent) => this.paymentIntent.set(paymentIntent),
        error: (error: unknown) => {
          this.paymentIntent.set(null);
          this.errorMessage.set(mapPaymentApiError(error));
        },
      });
  }

  simulateSuccess(): void {
    const paymentIntent = this.paymentIntent();
    if (!paymentIntent || this.submitting() || this.successPayment()) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.api
      .simulateSuccess(paymentIntent.id)
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (payment) => {
          this.successPayment.set(payment);
          this.paymentSucceeded.emit(payment);
        },
        error: (error: unknown) => this.errorMessage.set(mapPaymentApiError(error)),
      });
  }

  simulateFailure(): void {
    const paymentIntent = this.paymentIntent();
    if (!paymentIntent || this.submitting() || this.successPayment()) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.api
      .simulateFailure(paymentIntent.id, {
        failure_reason: this.failureReason(),
      })
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (failedIntent) => {
          this.paymentIntent.set(failedIntent);
          this.errorMessage.set(failedIntent.failure_reason ?? 'Pago simulado fallido.');
          this.paymentFailed.emit(failedIntent);
        },
        error: (error: unknown) => this.errorMessage.set(mapPaymentApiError(error)),
      });
  }
}
