import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { formatMoney } from '../../../../shared/utils/money.util';
import { Booking } from '../../../bookings/models/booking.models';
import { isBookingPayable } from '../../../bookings/utils/booking-payment.util';
import { Payment } from '../../data-access/payments.models';
import { PaymentCheckoutPanelComponent } from '../payment-checkout-panel/payment-checkout-panel.component';
import { PaymentStatusBadgeComponent } from '../payment-status-badge/payment-status-badge.component';

@Component({
  selector: 'app-payment-action-card',
  imports: [PaymentCheckoutPanelComponent, PaymentStatusBadgeComponent],
  templateUrl: './payment-action-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentActionCardComponent {
  readonly booking = input.required<Booking>();
  readonly payment = input<Payment | null>(null);

  readonly paymentCompleted = output<Payment>();
  readonly bookingShouldRefresh = output<void>();

  readonly checkoutOpen = signal(false);
  readonly completedPayment = signal<Payment | null>(null);

  readonly displayedPayment = computed(() => this.completedPayment() ?? this.payment());
  readonly coveredByPackage = computed(
    () => this.booking().payment_source === 'package' || !!this.booking().client_package_id,
  );
  readonly paymentConfirmed = computed(
    () =>
      this.coveredByPackage() ||
      this.booking().status === 'paid' ||
      this.booking().paid_at !== null ||
      this.displayedPayment()?.status === 'succeeded' ||
      this.displayedPayment()?.status === 'approved',
  );
  readonly canPay = computed(
    () =>
      isBookingPayable(this.booking().status) &&
      this.booking().status === 'confirmed' &&
      !this.paymentConfirmed() &&
      !this.coveredByPackage(),
  );
  readonly statusMessage = computed(() => this.messageForStatus(this.booking().status));
  readonly amountLabel = computed(() =>
    formatMoney(Number(this.booking().price_snapshot), 'UYU'),
  );

  openCheckout(): void {
    if (!this.canPay()) return;
    this.checkoutOpen.set(true);
  }

  closeCheckout(): void {
    this.checkoutOpen.set(false);
  }

  onPaymentSucceeded(payment: Payment): void {
    this.completedPayment.set(payment);
    this.checkoutOpen.set(false);
    this.paymentCompleted.emit(payment);
    this.bookingShouldRefresh.emit();
  }

  money(payment: Payment): string {
    return formatMoney(payment.amount, payment.currency);
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

  private messageForStatus(status: Booking['status']): string {
    switch (status) {
      case 'confirmed':
        if (this.coveredByPackage()) {
          return 'Esta reserva esta cubierta con una sesion de paquete.';
        }
        return 'Esta reserva esta confirmada y pendiente de pago.';
      case 'paid':
        return 'Pago confirmado.';
      case 'pending':
        return 'La reserva debe ser confirmada por el profesional antes de pagar.';
      case 'cancelled':
        return 'Esta reserva fue cancelada y no puede pagarse.';
      case 'completed':
        return 'Esta reserva ya finalizo.';
      case 'no_show':
        return 'Esta reserva fue marcada como no asistida.';
      case 'in_progress':
        return 'La reserva esta en curso.';
    }
  }
}
