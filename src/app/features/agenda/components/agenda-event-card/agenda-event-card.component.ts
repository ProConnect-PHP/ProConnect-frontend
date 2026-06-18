import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  AgendaBookingStatus,
  ProfessionalAgendaEvent,
} from '../../data-access/professional-agenda.models';
import { formatEventTimeRange } from '../../utils/agenda-date.util';

@Component({
  selector: 'app-agenda-event-card',
  imports: [RouterLink],
  template: `
    @if (compact()) {
      <article
        class="min-w-0 overflow-hidden rounded-2xl border bg-white p-3 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        [class.border-l-4]="true"
        [class.border-l-amber-500]="event().status === 'pending'"
        [class.border-l-indigo-500]="event().status === 'confirmed'"
        [class.border-l-emerald-500]="event().status === 'paid'"
        [class.border-l-sky-500]="event().status === 'in_progress'"
        [class.border-l-slate-400]="event().status === 'completed'"
        [class.border-l-rose-500]="event().status === 'cancelled' || event().status === 'no_show'"
        [class.border-slate-200]="!event().flags.is_cancelled"
        [class.border-rose-200]="event().flags.is_cancelled"
        [class.bg-rose-50]="event().flags.is_cancelled"
        [class.ring-4]="highlighted()"
        [class.ring-indigo-200]="highlighted()"
        [class.bg-indigo-50]="highlighted() && !event().flags.is_cancelled"
      >
        <div class="flex min-w-0 items-center gap-2">
          <span
            class="size-2 shrink-0 rounded-full"
            [class.bg-amber-500]="event().status === 'pending'"
            [class.bg-indigo-500]="event().status === 'confirmed'"
            [class.bg-emerald-500]="event().status === 'paid'"
            [class.bg-sky-500]="event().status === 'in_progress'"
            [class.bg-slate-400]="event().status === 'completed'"
            [class.bg-rose-500]="event().status === 'cancelled' || event().status === 'no_show'"
            aria-hidden="true"
          ></span>

          <p class="min-w-0 truncate text-[11px] font-black uppercase tracking-wide text-slate-500">
            {{ statusLabel(event().status) }}
          </p>
        </div>

        <h3 class="mt-2 line-clamp-2 text-sm font-black leading-5 tracking-tight text-slate-950">
          {{ event().title }}
        </h3>

        <p class="mt-2 whitespace-nowrap text-xs font-black text-slate-700">
          {{ timeRange() }}
        </p>

        @if (event().client) {
          <p class="mt-1 truncate text-xs text-slate-500">
            {{ event().client?.name }}
          </p>
        }

        <div class="mt-3">
          <a
            [routerLink]="['/professional/bookings', event().id]"
            class="inline-flex min-h-9 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline focus:outline-2 focus:outline-indigo-600"
          >
            Detalle
          </a>
        </div>

        <div class="mt-2 flex flex-wrap gap-1">
          @if (event().flags.uses_package) {
            <span class="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-black text-violet-800">
              Paquete
            </span>
          }

          @if (event().flags.has_video_session) {
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-700">
              Video
            </span>
          }
        </div>
      </article>
    } @else {
      <article
        class="rounded-3xl border bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
        [class.border-l-4]="true"
        [class.border-l-amber-500]="event().status === 'pending'"
        [class.border-l-indigo-500]="event().status === 'confirmed'"
        [class.border-l-emerald-500]="event().status === 'paid'"
        [class.border-l-sky-500]="event().status === 'in_progress'"
        [class.border-l-slate-400]="event().status === 'completed'"
        [class.border-l-rose-500]="event().status === 'cancelled' || event().status === 'no_show'"
        [class.border-slate-200]="!event().flags.is_cancelled"
        [class.border-rose-200]="event().flags.is_cancelled"
        [class.bg-rose-50]="event().flags.is_cancelled"
        [class.ring-4]="highlighted()"
        [class.ring-indigo-200]="highlighted()"
        [class.bg-indigo-50]="highlighted() && !event().flags.is_cancelled"
      >
        <div class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="inline-flex rounded-full px-3 py-1 text-xs font-black"
                [class.bg-amber-100]="event().status === 'pending'"
                [class.text-amber-800]="event().status === 'pending'"
                [class.bg-indigo-100]="event().status === 'confirmed'"
                [class.text-indigo-800]="event().status === 'confirmed'"
                [class.bg-emerald-100]="event().status === 'paid'"
                [class.text-emerald-800]="event().status === 'paid'"
                [class.bg-sky-100]="event().status === 'in_progress'"
                [class.text-sky-800]="event().status === 'in_progress'"
                [class.bg-slate-100]="event().status === 'completed'"
                [class.text-slate-700]="event().status === 'completed'"
                [class.bg-rose-100]="event().status === 'cancelled' || event().status === 'no_show'"
                [class.text-rose-800]="event().status === 'cancelled' || event().status === 'no_show'"
              >
                {{ statusLabel(event().status) }}
              </span>

              @if (event().flags.uses_package) {
                <span class="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-800">
                  Paquete
                </span>
              }

              @if (event().flags.has_video_session) {
                <span class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                  Video
                </span>
              }
            </div>

            <h3 class="mt-3 line-clamp-2 text-base font-black tracking-tight text-slate-950">
              {{ event().title }}
            </h3>

            <p class="mt-1 whitespace-nowrap text-sm font-bold text-slate-700">
              {{ timeRange() }}
            </p>

            @if (event().client) {
              <p class="mt-2 line-clamp-1 text-sm text-slate-600">
                Cliente:
                <span class="font-semibold text-slate-900">
                  {{ event().client?.name }}
                </span>
              </p>
            }

            @if (event().service?.address) {
              <p class="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                {{ event().service?.address }}
              </p>
            }
          </div>

          <div class="grid gap-2 sm:min-w-36">
            <a
              [routerLink]="['/professional/bookings', event().id]"
              class="inline-flex min-h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline focus:outline-2 focus:outline-indigo-600"
            >
              Ver detalle
            </a>
          </div>
        </div>
      </article>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaEventCardComponent {
  readonly event = input.required<ProfessionalAgendaEvent>();
  readonly compact = input(false);
  readonly highlighted = input(false);

  timeRange(): string {
    return formatEventTimeRange(this.event().starts_at, this.event().ends_at);
  }

  statusLabel(status: AgendaBookingStatus): string {
    const labels: Record<AgendaBookingStatus, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      paid: 'Pagada',
      in_progress: 'En curso',
      completed: 'Finalizada',
      cancelled: 'Cancelada',
      no_show: 'No asistida',
    };

    return labels[status] ?? status;
  }
}
