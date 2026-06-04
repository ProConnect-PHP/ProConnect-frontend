import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { PaymentIntentStatus, PaymentStatus } from '../../data-access/payments.models';

type PaymentBadgeKind = 'payment' | 'intent' | 'booking';

@Component({
  selector: 'app-payment-status-badge',
  templateUrl: './payment-status-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentStatusBadgeComponent {
  readonly status = input<PaymentStatus | PaymentIntentStatus | string | null>(null);
  readonly kind = input<PaymentBadgeKind>('payment');

  readonly normalizedStatus = computed(() => this.status() ?? 'unknown');
  readonly label = computed(() => this.labelFor(this.normalizedStatus(), this.kind()));
  readonly classes = computed(() => this.classesFor(this.normalizedStatus()));

  private labelFor(status: string, kind: PaymentBadgeKind): string {
    switch (status) {
      case 'paid':
        return 'Pagada';
      case 'succeeded':
        return kind === 'intent' ? 'Exitoso' : 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'Procesando';
      case 'failed':
        return 'Fallido';
      case 'expired':
        return 'Expirado';
      case 'cancelled':
        return 'Cancelado';
      case 'refunded':
        return 'Reembolsado';
      case 'partially_refunded':
        return 'Reembolso parcial';
      case 'confirmed':
        return 'Pendiente de pago';
      default:
        return 'Sin estado';
    }
  }

  private classesFor(status: string): string {
    const base = 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold';

    switch (status) {
      case 'paid':
      case 'succeeded':
        return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
      case 'pending':
      case 'confirmed':
        return `${base} border-amber-200 bg-amber-50 text-amber-700`;
      case 'processing':
        return `${base} border-blue-200 bg-blue-50 text-blue-700`;
      case 'failed':
        return `${base} border-rose-200 bg-rose-50 text-rose-700`;
      case 'expired':
      case 'cancelled':
      case 'refunded':
      case 'partially_refunded':
        return `${base} border-slate-200 bg-slate-100 text-slate-700`;
      default:
        return `${base} border-slate-200 bg-white text-slate-600`;
    }
  }
}
