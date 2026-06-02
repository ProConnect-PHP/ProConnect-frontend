import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { formatPrice } from '../../../public-discovery/utils/price-format.util';
import { Booking, BookingContext } from '../../models/booking.models';
import { formatBookingDate, formatBookingTimeRange } from '../../utils/booking-date-format.util';
import { BookingStatusBadgeComponent } from '../booking-status-badge/booking-status-badge.component';

@Component({
  selector: 'app-booking-detail-card',
  imports: [RouterLink, BookingStatusBadgeComponent],
  template: `
    <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <app-booking-status-badge [status]="booking().status" />
          <h1 class="mt-4 text-3xl font-black tracking-tight text-slate-950">
            {{ serviceName(booking()) }}
          </h1>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            {{ date(booking()) }} - {{ timeRange(booking()) }}
          </p>
        </div>
        <p class="rounded-2xl bg-slate-950 px-4 py-3 text-lg font-black text-white">
          {{ price(booking().price_snapshot) }}
        </p>
      </div>

      <dl class="mt-6 grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <dt class="text-xs font-bold uppercase tracking-wide text-slate-500">Profesional</dt>
          <dd class="mt-1 text-sm font-bold text-slate-950">{{ professionalName(booking()) }}</dd>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <dt class="text-xs font-bold uppercase tracking-wide text-slate-500">Cliente</dt>
          <dd class="mt-1 text-sm font-bold text-slate-950">{{ clientName(booking()) }}</dd>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <dt class="text-xs font-bold uppercase tracking-wide text-slate-500">Modalidad</dt>
          <dd class="mt-1 text-sm font-bold text-slate-950">{{ booking().modality }}</dd>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <dt class="text-xs font-bold uppercase tracking-wide text-slate-500">Duracion</dt>
          <dd class="mt-1 text-sm font-bold text-slate-950">{{ booking().duration_minutes_snapshot }} min</dd>
        </div>
      </dl>

      @if (booking().cancellation_reason || booking().reschedule_reason) {
        <div class="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          @if (booking().cancellation_reason) {
            <p><strong>Motivo de cancelacion:</strong> {{ booking().cancellation_reason }}</p>
          }
          @if (booking().reschedule_reason) {
            <p><strong>Motivo de reprogramacion:</strong> {{ booking().reschedule_reason }}</p>
          }
        </div>
      }

      @if (booking().service?.id) {
        <a
          class="mt-5 inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline focus:outline-2 focus:outline-indigo-600"
          [routerLink]="['/services', booking().service?.id]"
        >
          Ver servicio
        </a>
      }
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDetailCardComponent {
  readonly booking = input.required<Booking>();
  readonly context = input<BookingContext>('client');

  serviceName(booking: Booking): string {
    return booking.service?.name ?? 'Servicio reservado';
  }

  professionalName(booking: Booking): string {
    return booking.professional?.user?.name ?? 'Profesional';
  }

  clientName(booking: Booking): string {
    if (this.context() === 'client') return 'Vos';
    return booking.client?.name ?? 'Cliente';
  }

  date(booking: Booking): string {
    return formatBookingDate(booking.starts_at);
  }

  timeRange(booking: Booking): string {
    return formatBookingTimeRange(booking.starts_at, booking.ends_at);
  }

  price(value: string | number): string {
    return formatPrice(value);
  }
}
