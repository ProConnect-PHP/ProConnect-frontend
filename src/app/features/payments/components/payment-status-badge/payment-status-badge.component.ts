import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { PaymentIntentStatus, PaymentStatus } from '../../data-access/payments.models';
import { PaymentStatusTone, paymentStatusUi } from '../../utils/payment-labels.util';

type PaymentBadgeKind = 'payment' | 'intent' | 'booking';

@Component({
  selector: 'app-payment-status-badge',
  templateUrl: './payment-status-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentStatusBadgeComponent {
  readonly status = input<PaymentStatus | PaymentIntentStatus | string | null>(null);
  readonly displayStatus = input<string | null>(null);
  readonly kind = input<PaymentBadgeKind>('payment');

  readonly normalizedStatus = computed(() => this.status() ?? 'unknown');
  readonly statusUi = computed(() => paymentStatusUi(this.normalizedStatus(), this.displayStatus()));
  readonly label = computed(() => this.statusUi().label);
  readonly classes = computed(() => this.classesFor(this.statusUi().tone));

  private classesFor(tone: PaymentStatusTone): string {
    const base = 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold';

    switch (tone) {
      case 'success':
        return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
      case 'warning':
        return `${base} border-amber-200 bg-amber-50 text-amber-700`;
      case 'info':
        return `${base} border-blue-200 bg-blue-50 text-blue-700`;
      case 'danger':
        return `${base} border-rose-200 bg-rose-50 text-rose-700`;
      case 'neutral':
      default:
        return `${base} border-slate-200 bg-slate-100 text-slate-700`;
    }
  }
}
