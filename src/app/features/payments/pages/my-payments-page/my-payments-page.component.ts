import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { PaymentsListComponent } from '../../components/payments-list/payments-list.component';
import { PaymentsApi } from '../../data-access/payments.api';
import { mapPaymentApiError } from '../../data-access/payments-error.mapper';
import { PaymentHistoryItem } from '../../data-access/payments.models';

@Component({
  selector: 'app-my-payments-page',
  imports: [RouterLink, AppAlertComponent, AppLoadingSpinnerComponent, PaymentsListComponent],
  templateUrl: './my-payments-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyPaymentsPageComponent implements OnInit {
  private readonly api = inject(PaymentsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly payments = signal<PaymentHistoryItem[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .getMyPayments()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (payments) => this.payments.set(payments),
        error: (error: unknown) => {
          this.errorMessage.set(mapPaymentApiError(error, 'No pudimos cargar tus pagos.'));
        },
      });
  }
}
