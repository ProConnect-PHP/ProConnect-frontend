import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { PaymentMovementsListComponent } from '../../components/payment-movements-list/payment-movements-list.component';
import { PaymentMovement } from '../../data-access/payments.models';
import { ClientPaymentsStore } from '../../state/client-payments.store';

@Component({
  selector: 'app-my-payments-page',
  imports: [RouterLink, AppAlertComponent, AppLoadingSpinnerComponent, PaymentMovementsListComponent],
  templateUrl: './my-payments-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ClientPaymentsStore],
})
export class MyPaymentsPageComponent implements OnInit {
  readonly store = inject(ClientPaymentsStore);

  readonly selectedStatus = computed(() => {
    const filters = this.store.filters();
    if (filters.only_pending) return 'pending';
    if (filters.only_final) return 'final';
    return filters.status ?? '';
  });
  readonly selectedProvider = computed(() => this.store.filters().provider ?? '');
  readonly searchValue = computed(() => this.store.filters().search ?? '');

  ngOnInit(): void {
    this.store.load();
  }

  onStatusFilterChange(event: Event): void {
    const value = this.selectValue(event);

    if (value === 'pending') {
      this.store.updateFilters({ status: undefined, only_pending: true, only_final: undefined });
      return;
    }

    if (value === 'final') {
      this.store.updateFilters({ status: undefined, only_pending: undefined, only_final: true });
      return;
    }

    this.store.updateFilters({
      status: value || undefined,
      only_pending: undefined,
      only_final: undefined,
    });
  }

  onProviderFilterChange(event: Event): void {
    this.store.updateFilters({ provider: this.selectValue(event) || undefined });
  }

  applySearch(value: string): void {
    this.store.updateFilters({ search: value.trim() || undefined });
  }

  onRefreshRequested(payment: PaymentMovement): void {
    this.store.refreshMovement(payment);
  }

  onContinueCheckoutRequested(payment: PaymentMovement): void {
    this.store.continueCheckout(payment);
  }

  onRetryRequested(payment: PaymentMovement): void {
    this.store.retryPayment(payment);
  }

  private selectValue(event: Event): string {
    const target = event.target;
    return target instanceof HTMLSelectElement ? target.value : '';
  }
}
