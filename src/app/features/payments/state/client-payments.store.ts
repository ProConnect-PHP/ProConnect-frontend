import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, tap } from 'rxjs';

import { mapPaymentApiError } from '../data-access/payments-error.mapper';
import { PaymentsApi } from '../data-access/payments.api';
import { mapPaymentMovement } from '../data-access/payments.mapper';
import {
  ClientPaymentsQuery,
  PaymentMovement,
  PaymentsPaginationMeta,
} from '../data-access/payments.models';
import { PaymentRedirectService } from '../services/payment-redirect.service';

const initialMeta: PaymentsPaginationMeta = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

const initialFilters: ClientPaymentsQuery = {
  page: 1,
  per_page: 10,
};

/** Signal state for the client-only unified payment movement list. */
@Injectable()
export class ClientPaymentsStore {
  private readonly api = inject(PaymentsApi);
  private readonly redirectService = inject(PaymentRedirectService);
  private readonly destroyRef = inject(DestroyRef);
  private requestVersion = 0;

  readonly payments = signal<PaymentMovement[]>([]);
  readonly meta = signal<PaymentsPaginationMeta>(initialMeta);
  readonly filters = signal<ClientPaymentsQuery>(initialFilters);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly activeMovementId = signal<string | null>(null);

  readonly currentPage = computed(() => this.meta().current_page);
  readonly canGoPrevious = computed(() => this.currentPage() > 1);
  readonly canGoNext = computed(() => this.currentPage() < this.meta().last_page);
  readonly isEmpty = computed(() => !this.loading() && !this.errorMessage() && this.payments().length === 0);
  readonly hasActiveFilters = computed(() => {
    const { page, per_page, ...filters } = this.filters();
    return Object.values(filters).some((value) => value !== undefined && value !== null && value !== '');
  });

  load(page = this.filters().page ?? 1): void {
    const requestVersion = ++this.requestVersion;
    const filters = { ...this.filters(), page };

    this.filters.set(filters);
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .getMyPaymentMovements(filters)
      .pipe(
        finalize(() => {
          if (requestVersion === this.requestVersion) this.loading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (requestVersion !== this.requestVersion) return;

          this.payments.set(response.payments);
          this.meta.set(response.meta);
          this.filters.update((current) => ({ ...current, page: response.meta.current_page }));
        },
        error: (error: unknown) => {
          if (requestVersion !== this.requestVersion) return;
          this.errorMessage.set(mapPaymentApiError(error, 'No pudimos cargar tus pagos.'));
        },
      });
  }

  updateFilters(filters: Partial<ClientPaymentsQuery>): void {
    this.filters.update((current) => ({
      ...current,
      ...filters,
      page: 1,
    }));
    this.load(1);
  }

  clearFilters(): void {
    this.filters.set(initialFilters);
    this.load(1);
  }

  previousPage(): void {
    if (this.canGoPrevious()) this.load(this.currentPage() - 1);
  }

  nextPage(): void {
    if (this.canGoNext()) this.load(this.currentPage() + 1);
  }

  refreshMovement(movement: PaymentMovement): void {
    if (!movement.can_refresh_status || movement.kind !== 'payment_intent') return;

    this.activeMovementId.set(movement.id);
    this.errorMessage.set(null);

    this.api
      .refreshPaymentMovement(movement.id)
      .pipe(
        tap((updatedMovement) => this.replaceMovement(updatedMovement)),
        finalize(() => this.activeMovementId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: (error: unknown) =>
          this.errorMessage.set(mapPaymentApiError(error, 'No pudimos actualizar el estado del pago.')),
      });
  }

  continueCheckout(movement: PaymentMovement): void {
    if (!movement.can_continue_checkout || movement.kind !== 'payment_intent') return;

    if (movement.checkout_url) {
      this.redirectService.redirectToCheckout(movement.checkout_url);
      return;
    }

    this.activeMovementId.set(movement.id);
    this.errorMessage.set(null);

    this.api
      .createCheckout(movement.id, { provider: movement.provider })
      .pipe(
        tap((paymentIntent) => {
          const updatedMovement = mapPaymentMovement({
            ...paymentIntent,
            kind: 'payment_intent',
            can_retry: movement.can_retry,
            can_continue_checkout: true,
            can_refresh_status: movement.can_refresh_status,
            can_view_booking: movement.can_view_booking,
            display_status: movement.display_status,
          });
          this.replaceMovement(updatedMovement);

          if (paymentIntent.checkout_url) {
            this.redirectService.redirectToCheckout(paymentIntent.checkout_url);
            return;
          }

          this.errorMessage.set('No se pudo obtener la URL para continuar el pago.');
        }),
        finalize(() => this.activeMovementId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: (error: unknown) =>
          this.errorMessage.set(mapPaymentApiError(error, 'No pudimos continuar el pago.')),
      });
  }

  retryPayment(movement: PaymentMovement): void {
    if (!movement.can_retry || movement.kind !== 'payment_intent') return;
    this.continueCheckout({ ...movement, can_continue_checkout: true });
  }

  private replaceMovement(updatedMovement: PaymentMovement): void {
    this.payments.update((payments) =>
      payments.map((payment) => (payment.id === updatedMovement.id ? updatedMovement : payment)),
    );
  }
}
