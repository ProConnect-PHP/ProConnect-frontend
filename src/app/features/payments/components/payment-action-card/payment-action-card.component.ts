import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { formatMoney } from '../../../../shared/utils/money.util';
import { Booking } from '../../../bookings/models/booking.models';
import { Payment, PaymentIntent } from '../../data-access/payments.models';
import { PaymentStatusBadgeComponent } from '../payment-status-badge/payment-status-badge.component';
import { SimulatedCheckoutPanelComponent } from '../simulated-checkout-panel/simulated-checkout-panel.component';

@Component({
  selector: 'app-payment-action-card',
  imports: [PaymentStatusBadgeComponent, SimulatedCheckoutPanelComponent],
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
  readonly lastFailedIntent = signal<PaymentIntent | null>(null);

  readonly displayedPayment = computed(() => this.completedPayment() ?? this.payment());
  readonly paymentConfirmed = computed(
    () => this.booking().status === 'paid' || this.displayedPayment()?.status === 'succeeded',
  );
  readonly canPay = computed(() => this.booking().status === 'confirmed' && !this.paymentConfirmed());
  readonly statusMessage = computed(() => this.messageForStatus(this.booking().status));

  openCheckout(): void {
    if (!this.canPay()) return;
    this.checkoutOpen.set(true);
  }

  closeCheckout(): void {
    this.checkoutOpen.set(false);
  }

  onPaymentSucceeded(payment: Payment): void {
    this.completedPayment.set(payment);
    this.lastFailedIntent.set(null);
    this.checkoutOpen.set(false);
    this.paymentCompleted.emit(payment);
    this.bookingShouldRefresh.emit();
  }

  onPaymentFailed(paymentIntent: PaymentIntent): void {
    this.lastFailedIntent.set(paymentIntent);
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
