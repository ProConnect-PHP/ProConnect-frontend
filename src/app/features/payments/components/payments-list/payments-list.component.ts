import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { formatMoney } from '../../../../shared/utils/money.util';
import { isBookingPayable } from '../../../bookings/utils/booking-payment.util';
import { Payment, PaymentHistoryItem } from '../../data-access/payments.models';
import { paymentProviderLabel } from '../../utils/payment-labels.util';
import { PaymentStatusBadgeComponent } from '../payment-status-badge/payment-status-badge.component';

type PaymentsListContext = 'client' | 'professional';
type PaymentsListItem = Payment | PaymentHistoryItem;

@Component({
  selector: 'app-payments-list',
  imports: [RouterLink, AppEmptyStateComponent, PaymentStatusBadgeComponent],
  templateUrl: './payments-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsListComponent {
  readonly payments = input.required<PaymentsListItem[]>();
  readonly context = input<PaymentsListContext>('client');

  emptyTitle(): string {
    return this.context() === 'professional'
      ? 'Todavia no recibiste pagos.'
      : 'Todavía no tenés operaciones de pago.';
  }

  emptyDescription(): string {
    return this.context() === 'professional'
      ? 'Los pagos confirmados de tus reservas apareceran aca.'
      : 'Cuando pagues, rechaces o intentes pagar una reserva, aparecerá acá.';
  }

  paymentDetailLink(payment: PaymentsListItem): string | null {
    return this.context() === 'client' ? `/my-payments/${payment.id}` : null;
  }

  bookingLink(payment: PaymentsListItem): string | null {
    if (!payment.booking_id) return null;

    return this.context() === 'professional'
      ? `/professional/bookings/${payment.booking_id}`
      : `/my-bookings/${payment.booking_id}`;
  }

  money(payment: PaymentsListItem): string {
    return formatMoney(payment.amount, payment.currency);
  }

  providerLabel(payment: PaymentsListItem): string {
    return paymentProviderLabel(payment.provider);
  }

  associationLabel(payment: PaymentsListItem): string {
    if (payment.booking_id) {
      return payment.booking?.service?.name
        ? `Reserva de ${payment.booking.service.name}`
        : 'Reserva';
    }

    return payment.package_product?.name ?? payment.client_package?.name ?? 'Paquete';
  }

  associationId(payment: PaymentsListItem): string {
    if (this.isHistoryItem(payment)) {
      return (
        payment.booking_id ??
        payment.client_package?.id ??
        payment.package_product_id ??
        'No disponible'
      );
    }

    return (
      payment.booking_id ??
      payment.client_package_id ??
      payment.package_product_id ??
      'No disponible'
    );
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

  status(payment: PaymentsListItem): Payment['status'] | PaymentHistoryItem['status'] {
    return payment.status;
  }

  displayStatus(payment: PaymentsListItem): string | null {
    return this.isHistoryItem(payment) ? payment.display_status : null;
  }

  relevantDate(payment: PaymentsListItem): string | null {
    if (this.isHistoryItem(payment)) {
      return payment.paid_at ?? payment.failed_at ?? payment.cancelled_at ?? payment.created_at;
    }

    return payment.paid_at ?? payment.created_at;
  }

  dateLabel(payment: PaymentsListItem): string {
    return payment.paid_at ? 'Fecha de pago' : 'Fecha del intento';
  }

  failureReason(payment: PaymentsListItem): string | null {
    return payment.failure_reason;
  }

  statusMessage(payment: PaymentsListItem): string {
    switch (this.displayStatus(payment) ?? payment.status) {
      case 'paid':
      case 'approved':
      case 'succeeded':
      case 'completed':
        return 'Pago confirmado correctamente.';
      case 'rejected':
      case 'denied':
        return 'El proveedor rechazó este pago.';
      case 'failed':
        return 'No pudimos completar este pago.';
      case 'cancelled':
        return 'Este pago fue cancelado.';
      case 'expired':
        return 'Este intento de pago expiró.';
      case 'processing':
      case 'pending_capture':
        return 'El proveedor todavía está procesando este pago.';
      case 'not_confirmed':
      case 'checkout_created':
        return 'No encontramos un pago asociado a este intento.';
      default:
        return '';
    }
  }

  canRetry(payment: PaymentsListItem): boolean {
    return (
      this.context() === 'client' &&
      this.isHistoryItem(payment) &&
      payment.source === 'payment_intent' &&
      payment.can_retry === true &&
      !!payment.booking_id &&
      isBookingPayable(payment.booking?.status)
    );
  }

  retryLink(payment: PaymentsListItem): string | null {
    return this.canRetry(payment) && payment.booking_id
      ? `/my-bookings/${payment.booking_id}`
      : null;
  }

  isProfessionalPayment(payment: PaymentsListItem): payment is Payment {
    return !this.isHistoryItem(payment);
  }

  private isHistoryItem(payment: PaymentsListItem): payment is PaymentHistoryItem {
    return 'source' in payment;
  }
}
