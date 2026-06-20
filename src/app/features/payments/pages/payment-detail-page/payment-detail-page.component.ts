import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, map, of, switchMap } from 'rxjs';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { formatMoney } from '../../../../shared/utils/money.util';
import { isBookingPayable } from '../../../bookings/utils/booking-payment.util';
import { PaymentStatusBadgeComponent } from '../../components/payment-status-badge/payment-status-badge.component';
import { PaymentsApi } from '../../data-access/payments.api';
import { mapPaymentApiError } from '../../data-access/payments-error.mapper';
import {
  PaymentDetail,
  PaymentHistoryItem,
  PaymentIntent,
  PaymentProvider,
} from '../../data-access/payments.models';
import { paymentProviderLabel } from '../../utils/payment-labels.util';

@Component({
  selector: 'app-payment-detail-page',
  imports: [
    RouterLink,
    AppAlertComponent,
    AppEmptyStateComponent,
    AppLoadingSpinnerComponent,
    PaymentStatusBadgeComponent,
  ],
  templateUrl: './payment-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailPageComponent implements OnInit {
  private readonly api = inject(PaymentsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly detail = signal<PaymentDetail | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('paymentId')),
        switchMap((paymentId) => this.loadPayment(paymentId)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((detail) => this.detail.set(detail));
  }

  money(payment: PaymentHistoryItem): string {
    return formatMoney(payment.amount, payment.currency);
  }

  providerLabel(provider: PaymentProvider): string {
    return paymentProviderLabel(provider);
  }

  operationTitle(payment: PaymentHistoryItem): string {
    switch (payment.status) {
      case 'paid':
      case 'approved':
      case 'succeeded':
      case 'completed':
        return 'Pago confirmado';
      case 'rejected':
      case 'denied':
        return 'Pago rechazado';
      case 'failed':
        return 'Pago fallido';
      case 'cancelled':
        return 'Pago cancelado';
      case 'expired':
        return 'Intento expirado';
      case 'processing':
      case 'pending_capture':
        return 'Pago en proceso';
      default:
        return 'Operación de pago';
    }
  }

  formatDateTime(value: string | null): string {
    if (!value) return 'No disponible';

    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('es-UY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  attemptDate(attempt: PaymentIntent): string | null {
    return attempt.succeeded_at ?? attempt.failed_at ?? attempt.created_at;
  }

  operationDate(payment: PaymentHistoryItem): string | null {
    return payment.paid_at ?? payment.failed_at ?? payment.cancelled_at ?? payment.created_at;
  }

  operationDateLabel(payment: PaymentHistoryItem): string {
    return payment.source === 'payment_intent' ? 'Fecha del intento' : 'Fecha de pago';
  }

  canRetry(detail: PaymentDetail): boolean {
    const booking = detail.booking ?? detail.operation.booking;

    return (
      detail.source === 'payment_intent' &&
      detail.operation.can_retry === true &&
      !!detail.operation.booking_id &&
      isBookingPayable(booking?.status)
    );
  }

  retryLink(detail: PaymentDetail): string | null {
    return this.canRetry(detail) && detail.operation.booking_id
      ? `/my-bookings/${detail.operation.booking_id}`
      : null;
  }

  isCancelledBooking(status: string | null | undefined): boolean {
    return String(status ?? '').toLowerCase() === 'cancelled';
  }

  private loadPayment(paymentId: string | null) {
    this.loading.set(true);
    this.errorMessage.set(null);

    if (!paymentId) {
      this.loading.set(false);
      this.errorMessage.set('Pago no encontrado.');
      return of<PaymentDetail | null>(null);
    }

    return this.api.getMyPayment(paymentId).pipe(
      catchError((error: unknown) => {
        this.errorMessage.set(mapPaymentApiError(error, 'No pudimos cargar el detalle del pago.'));
        return of<PaymentDetail | null>(null);
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
