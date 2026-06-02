import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Booking } from '../../models/booking.models';
import { formatBookingDateTime } from '../../utils/booking-date-format.util';

type TimelineItem = {
  label: string;
  value: string | null;
  active: boolean;
};

@Component({
  selector: 'app-booking-timeline',
  template: `
    <section class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 class="text-lg font-black tracking-tight text-slate-950">Historial</h2>
      <ol class="mt-5 grid gap-4">
        @for (item of items(); track item.label) {
          <li class="flex gap-3">
            <span
              class="mt-1 size-3 shrink-0 rounded-full"
              [class.bg-indigo-600]="item.active"
              [class.bg-slate-200]="!item.active"
              aria-hidden="true"
            ></span>
            <div>
              <p class="text-sm font-bold text-slate-900">{{ item.label }}</p>
              <p class="mt-1 text-sm text-slate-500">
                {{ item.value ? formatDate(item.value) : 'Pendiente' }}
              </p>
            </div>
          </li>
        }
      </ol>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingTimelineComponent {
  readonly booking = input.required<Booking>();

  readonly items = computed<TimelineItem[]>(() => {
    const booking = this.booking();

    return [
      { label: 'Creada', value: booking.created_at, active: true },
      { label: 'Confirmada', value: booking.confirmed_at, active: !!booking.confirmed_at },
      { label: 'Pagada', value: booking.paid_at, active: !!booking.paid_at },
      { label: 'Cancelada', value: booking.cancelled_at, active: !!booking.cancelled_at },
      { label: 'Finalizada', value: booking.completed_at, active: !!booking.completed_at },
    ];
  });

  formatDate(value: string): string {
    return formatBookingDateTime(value);
  }
}
