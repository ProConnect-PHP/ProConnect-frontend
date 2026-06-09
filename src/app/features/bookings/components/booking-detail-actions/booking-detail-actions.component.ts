import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnChanges,
  SimpleChanges,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { BookingsApi } from '../../data-access/bookings.api';
import { BookingAvailableActions } from '../../models/booking-available-actions.model';
import { Booking } from '../../models/booking.models';
import { bookingErrorMessage } from '../../utils/booking-error-message.util';

@Component({
  selector: 'app-booking-detail-actions',
  template: `
    <section class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 class="text-lg font-black tracking-tight text-slate-950">Acciones</h2>

      @if (loading()) {
        <p class="mt-3 text-sm text-slate-600" role="status">
          Consultando acciones disponibles...
        </p>
      }

      @if (errorMessage()) {
        <p
          class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
          role="status"
        >
          {{ errorMessage() }}
        </p>
      }

      <div class="mt-4 grid gap-3">
        <div>
          <button
            type="button"
            class="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 focus:outline focus:outline-2 focus:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="loading() || !canReschedule()"
            [attr.aria-describedby]="
              actions() && !canReschedule() ? 'reschedule-disabled-reason' : null
            "
            (click)="rescheduleClicked.emit()"
          >
            Reprogramar sesion
          </button>
          @if (actions() && !canReschedule()) {
            <p
              id="reschedule-disabled-reason"
              class="mt-2 text-sm leading-5 text-slate-600"
            >
              {{
                actions()?.rescheduleDisabledReason ??
                  'La reprogramacion no esta disponible para esta reserva.'
              }}
            </p>
          }
        </div>

        <div>
          <button
            type="button"
            class="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50 focus:outline focus:outline-2 focus:outline-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="loading() || !canCancel()"
            [attr.aria-describedby]="
              actions() && !canCancel() ? 'cancel-disabled-reason' : null
            "
            (click)="cancelClicked.emit()"
          >
            Cancelar sesion
          </button>
          @if (actions() && !canCancel()) {
            <p id="cancel-disabled-reason" class="mt-2 text-sm leading-5 text-slate-600">
              {{
                actions()?.cancelDisabledReason ??
                  'La cancelacion no esta disponible para esta reserva.'
              }}
            </p>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDetailActionsComponent implements OnChanges {
  private readonly api = inject(BookingsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly booking = input.required<Booking>();
  readonly cancelClicked = output<void>();
  readonly rescheduleClicked = output<void>();

  readonly actions = signal<BookingAvailableActions | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly canCancel = computed(() => this.actions()?.canCancel ?? false);
  readonly canReschedule = computed(() => this.actions()?.canReschedule ?? false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['booking']) this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .getAvailableActions(this.booking().id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (actions) => this.actions.set(actions),
        error: (error: unknown) => {
          this.actions.set(null);
          this.errorMessage.set(
            bookingErrorMessage(
              error,
              'No pudimos consultar las acciones disponibles. Intenta nuevamente.',
            ),
          );
        },
      });
  }
}
