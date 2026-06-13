import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { PaymentsApi } from '../../data-access/payments.api';
import { mapPaymentApiError } from '../../data-access/payments-error.mapper';
import { PaymentIntent, PaymentStatusResult } from '../../data-access/payments.models';
import { PaymentSummaryCardComponent } from '../payment-summary-card/payment-summary-card.component';

@Component({
  selector: 'app-simulated-checkout-panel',
  imports: [PaymentSummaryCardComponent],
  templateUrl: './simulated-checkout-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatedCheckoutPanelComponent {
  private readonly api = inject(PaymentsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly paymentIntent = input.required<PaymentIntent>();
  readonly statusChanged = output<PaymentStatusResult>();

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  simulateSuccess(): void {
    if (this.submitting()) return;
    this.submitSimulation(this.api.simulateSuccess(this.paymentIntent().id));
  }

  simulateFailure(): void {
    if (this.submitting()) return;
    this.submitSimulation(
      this.api.simulateFailure(this.paymentIntent().id, {
        failure_reason: 'Pago simulado rechazado.',
      }),
    );
  }

  private submitSimulation(request: ReturnType<PaymentsApi['simulateSuccess']>): void {
    this.submitting.set(true);
    this.errorMessage.set(null);

    request
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => this.statusChanged.emit(result),
        error: (error: unknown) => this.errorMessage.set(mapPaymentApiError(error)),
      });
  }
}
