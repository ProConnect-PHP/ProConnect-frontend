import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { formatPrice } from '../../../public-discovery/utils/price-format.util';
import { Booking, BookingContext } from '../../models/booking.models';
import { formatBookingDate, formatBookingTimeRange } from '../../utils/booking-date-format.util';
import { BookingActionsComponent } from '../booking-actions/booking-actions.component';
import { BookingStatusBadgeComponent } from '../booking-status-badge/booking-status-badge.component';

@Component({
  selector: 'app-booking-card',
  imports: [RouterLink, BookingActionsComponent, BookingStatusBadgeComponent],
  template: `
    <article class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <app-booking-status-badge [status]="booking().status" />
            @if (context() === 'client' && booking().status === 'confirmed') {
              <span class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                Pendiente de pago
              </span>
            }
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {{ booking().modality }}
            </span>
          </div>

          <h2 class="mt-4 line-clamp-2 text-xl font-black tracking-tight text-slate-950">
            {{ serviceName(booking()) }}
          </h2>
          <p class="mt-2 text-sm font-semibold text-slate-600">
            {{ contextLabel(booking()) }}
          </p>
          <p class="mt-3 text-sm leading-6 text-slate-600">
            {{ date(booking()) }} - {{ timeRange(booking()) }} - {{ price(booking().price_snapshot) }}
          </p>
        </div>

        <div class="grid gap-2 sm:min-w-44">
          <a
            class="inline-flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus:outline focus:outline-2 focus:outline-slate-700"
            [routerLink]="detailLink(booking())"
          >
            Ver detalle
          </a>
          @if (context() === 'client' && booking().status === 'confirmed') {
            <a
              class="inline-flex min-h-10 items-center justify-center rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800 shadow-sm transition hover:bg-amber-100 focus:outline focus:outline-2 focus:outline-amber-700"
              [routerLink]="detailLink(booking())"
            >
              Pagar
            </a>
          }
        </div>
      </div>

      <div class="mt-5 border-t border-slate-100 pt-4">
        <app-booking-actions
          [booking]="booking()"
          [context]="context()"
          [loadingAction]="loadingAction()"
          (confirmClicked)="confirmClicked.emit(booking())"
          (cancelClicked)="cancelClicked.emit(booking())"
          (rescheduleClicked)="rescheduleClicked.emit(booking())"
        />
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingCardComponent {
  readonly booking = input.required<Booking>();
  readonly context = input<BookingContext>('client');
  readonly loadingAction = input<string | null>(null);

  readonly confirmClicked = output<Booking>();
  readonly cancelClicked = output<Booking>();
  readonly rescheduleClicked = output<Booking>();

  serviceName(booking: Booking): string {
    return booking.service?.name ?? 'Servicio reservado';
  }

  contextLabel(booking: Booking): string {
    if (this.context() === 'professional') return booking.client?.name ?? 'Cliente';
    return booking.professional?.user?.name ?? 'Profesional';
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

  detailLink(booking: Booking): string {
    return this.context() === 'professional'
      ? `/professional/bookings/${booking.id}`
      : `/my-bookings/${booking.id}`;
  }
}
