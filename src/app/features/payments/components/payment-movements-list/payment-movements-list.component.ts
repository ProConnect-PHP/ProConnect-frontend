import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { formatMoney } from '../../../../shared/utils/money.util';
import { PaymentMovement } from '../../data-access/payments.models';
import { paymentProviderLabel } from '../../utils/payment-labels.util';
import { PaymentStatusBadgeComponent } from '../payment-status-badge/payment-status-badge.component';

@Component({
  selector: 'app-payment-movements-list',
  imports: [RouterLink, AppEmptyStateComponent, PaymentStatusBadgeComponent],
  templateUrl: './payment-movements-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMovementsListComponent {
  readonly payments = input.required<PaymentMovement[]>();
  readonly hasActiveFilters = input(false);
  readonly activeMovementId = input<string | null>(null);

  readonly refreshRequested = output<PaymentMovement>();
  readonly continueCheckoutRequested = output<PaymentMovement>();
  readonly retryRequested = output<PaymentMovement>();

  emptyTitle(): string {
    return this.hasActiveFilters()
      ? 'No encontramos pagos con esos filtros.'
      : 'Todavia no tenes pagos registrados.';
  }

  emptyDescription(): string {
    return this.hasActiveFilters()
      ? 'Probá cambiar los filtros o volver a ver todos los movimientos.'
      : 'Cuando inicies o completes un pago, va a aparecer en esta seccion.';
  }

  money(payment: PaymentMovement): string {
    return formatMoney(payment.amount, payment.currency);
  }

  providerLabel(payment: PaymentMovement): string {
    return payment.provider_label?.trim() || paymentProviderLabel(payment.provider);
  }

  typeLabel(payment: PaymentMovement): string {
    return payment.kind === 'payment_intent' ? 'Intento de pago' : 'Pago';
  }

  dateLabel(payment: PaymentMovement): string {
    return payment.paid_at ? 'Fecha de pago' : 'Última actualización';
  }

  relevantDate(payment: PaymentMovement): string | null {
    return payment.paid_at ?? payment.updated_at ?? payment.created_at;
  }

  reference(payment: PaymentMovement): string {
    return payment.provider_reference ?? payment.id;
  }

  bookingLink(payment: PaymentMovement): string | null {
    return payment.can_view_booking && payment.booking?.id
      ? `/my-bookings/${payment.booking.id}`
      : null;
  }

  isActive(payment: PaymentMovement): boolean {
    return this.activeMovementId() === payment.id;
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
