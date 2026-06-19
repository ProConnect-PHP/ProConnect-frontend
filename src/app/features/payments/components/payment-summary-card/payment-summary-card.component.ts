import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { formatMoney } from '../../../../shared/utils/money.util';
import { Booking } from '../../../bookings/models/booking.models';
import { Payment, PaymentIntent } from '../../data-access/payments.models';
import { paymentProviderLabel } from '../../utils/payment-labels.util';
import { PaymentStatusBadgeComponent } from '../payment-status-badge/payment-status-badge.component';

type PaymentSummarySurface = 'card' | 'plain';
type PaymentSummaryStatusKind = 'payment' | 'intent' | 'booking';

@Component({
  selector: 'app-payment-summary-card',
  imports: [PaymentStatusBadgeComponent],
  templateUrl: './payment-summary-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentSummaryCardComponent {
  readonly payment = input<Payment | null>(null);
  readonly paymentIntent = input<PaymentIntent | null>(null);
  readonly booking = input<Booking | null>(null);
  readonly surface = input<PaymentSummarySurface>('card');

  readonly amount = computed(() => {
    const payment = this.payment();
    const paymentIntent = this.paymentIntent();
    const booking = this.booking();

    if (payment) return payment.amount;
    if (paymentIntent) return paymentIntent.amount;
    if (booking) return Number(booking.price_snapshot);

    return 0;
  });

  readonly currency = computed(() => this.payment()?.currency ?? this.paymentIntent()?.currency ?? 'UYU');
  readonly formattedAmount = computed(() => formatMoney(this.amount(), this.currency()));
  readonly provider = computed(
    () => this.payment()?.provider ?? this.paymentIntent()?.provider ?? 'simulator',
  );
  readonly providerLabel = computed(() => paymentProviderLabel(this.provider()));
  readonly status = computed(
    () => this.payment()?.status ?? this.paymentIntent()?.status ?? this.booking()?.status ?? null,
  );
  readonly statusKind = computed<PaymentSummaryStatusKind>(() => {
    if (this.payment()) return 'payment';
    if (this.paymentIntent()) return 'intent';
    return 'booking';
  });
  readonly paidAt = computed(() => this.payment()?.paid_at ?? this.booking()?.paid_at ?? null);
  readonly expiresAt = computed(() => this.paymentIntent()?.expires_at ?? null);
  readonly reference = computed(
    () => this.payment()?.provider_reference ?? this.paymentIntent()?.provider_reference ?? null,
  );
  readonly hasPaymentData = computed(() => !!this.payment() || !!this.paymentIntent() || !!this.booking());
  readonly containerClasses = computed(() =>
    this.surface() === 'card'
      ? 'rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm'
      : 'p-0',
  );

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
