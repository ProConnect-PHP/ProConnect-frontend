import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { PaymentsListComponent } from '../../components/payments-list/payments-list.component';
import { PaymentsApi } from '../../data-access/payments.api';
import { mapPaymentApiError } from '../../data-access/payments-error.mapper';
import { PaginatedMeta, PaymentHistoryItem } from '../../data-access/payments.models';

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

  readonly page = signal(1);
  readonly perPage = signal(10);
  readonly meta = signal<PaginatedMeta | null>(null);

  readonly hasPagination = computed(() => {
    const meta = this.meta();
    return !!meta && meta.last_page > 1;
  });

  readonly canGoPrevious = computed(() => {
    const meta = this.meta();
    return !!meta && meta.current_page > 1;
  });

  readonly canGoNext = computed(() => {
    const meta = this.meta();
    return !!meta && meta.current_page < meta.last_page;
  });

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(page = this.page()): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .getMyPayments(page, this.perPage())
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.payments.set(response.data);
          this.meta.set(response.meta);
          this.page.set(response.meta.current_page);
        },
        error: (error: unknown) => {
          this.errorMessage.set(mapPaymentApiError(error, 'No pudimos cargar tus pagos.'));
        },
      });
  }

  goToPreviousPage(): void {
    if (!this.canGoPrevious()) return;

    this.loadPayments(this.page() - 1);
  }

  goToNextPage(): void {
    if (!this.canGoNext()) return;

    this.loadPayments(this.page() + 1);
  }

  goToPage(page: number): void {
    const meta = this.meta();

    if (!meta) return;
    if (page < 1 || page > meta.last_page) return;
    if (page === meta.current_page) return;

    this.loadPayments(page);
  }
}
