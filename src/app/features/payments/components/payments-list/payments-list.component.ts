import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { formatMoney } from '../../../../shared/utils/money.util';
import { Payment } from '../../data-access/payments.models';
import { paymentProviderLabel } from '../../utils/payment-labels.util';
import { PaymentStatusBadgeComponent } from '../payment-status-badge/payment-status-badge.component';

type PaymentsListContext = 'client' | 'professional';

@Component({
  selector: 'app-payments-list',
  imports: [RouterLink, AppEmptyStateComponent, PaymentStatusBadgeComponent],
  templateUrl: './payments-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsListComponent {
  readonly payments = input.required<Payment[]>();
  readonly context = input<PaymentsListContext>('client');

  emptyTitle(): string {
    return this.context() === 'professional'
      ? 'Todavia no recibiste pagos.'
      : 'Todavia no tenes pagos registrados.';
  }

  emptyDescription(): string {
    return this.context() === 'professional'
      ? 'Los pagos confirmados de tus reservas apareceran aca.'
      : 'Cuando pagues una reserva, aparecera en esta seccion.';
  }

  bookingLink(payment: Payment): string | null {
    if (!payment.booking_id) return null;

    return this.context() === 'professional'
      ? `/professional/bookings/${payment.booking_id}`
      : `/my-bookings/${payment.booking_id}`;
  }

  money(payment: Payment): string {
    return formatMoney(payment.amount, payment.currency);
  }

  providerLabel(payment: Payment): string {
    return paymentProviderLabel(payment.provider);
  }

  associationLabel(payment: Payment): string {
    if (payment.booking_id) {
      return payment.booking?.service?.name
        ? `Reserva de ${payment.booking.service.name}`
        : 'Reserva';
    }

    return payment.package_product?.name ?? payment.client_package?.name ?? 'Paquete';
  }

  associationId(payment: Payment): string {
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
}
