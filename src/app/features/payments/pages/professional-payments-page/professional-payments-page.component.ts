import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { PaymentsListComponent } from '../../components/payments-list/payments-list.component';
import { PaymentsApi } from '../../data-access/payments.api';
import { mapPaymentApiError } from '../../data-access/payments-error.mapper';
import { Payment, PaymentsPaginationMeta } from '../../data-access/payments.models';

const initialMeta: PaymentsPaginationMeta = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

@Component({
  selector: 'app-professional-payments-page',
  imports: [RouterLink, AppAlertComponent, AppLoadingSpinnerComponent, PaymentsListComponent],
  templateUrl: './professional-payments-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalPaymentsPageComponent implements OnInit {
  private readonly api = inject(PaymentsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly payments = signal<Payment[]>([]);
  readonly meta = signal<PaymentsPaginationMeta>(initialMeta);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly profileRequired = signal(false);
  readonly page = signal(1);
  readonly perPage = 10;

  readonly canGoPrevious = computed(() => this.page() > 1);
  readonly canGoNext = computed(() => this.page() < this.meta().last_page);

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(page = this.page()): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.profileRequired.set(false);
    this.page.set(page);

    this.api
      .listProfessionalPayments({ page, per_page: this.perPage })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.payments.set(response.payments);
          this.meta.set(response.meta);
          this.page.set(response.meta.current_page);
        },
        error: (error: unknown) => {
          this.errorMessage.set(mapPaymentApiError(error, 'No pudimos cargar los pagos recibidos.'));
          this.profileRequired.set(
            error instanceof ApiClientError && error.type === 'ProfessionalProfileRequired',
          );
        },
      });
  }

  previousPage(): void {
    if (!this.canGoPrevious()) return;
    this.loadPayments(this.page() - 1);
  }

  nextPage(): void {
    if (!this.canGoNext()) return;
    this.loadPayments(this.page() + 1);
  }
}
