import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { BookingsApi } from '../../data-access/bookings.api';
import { Booking } from '../../models/booking.models';
import { bookingErrorMessage } from '../../utils/booking-error-message.util';

@Component({
  selector: 'app-booking-cancel-dialog',
  imports: [ReactiveFormsModule, AppAlertComponent],
  template: `
    @if (open() && booking()) {
      <div class="fixed inset-0 z-50">
        <button
          type="button"
          class="absolute inset-0 bg-slate-950/50"
          aria-label="Cerrar cancelacion"
          (click)="closed.emit()"
        ></button>

        <section
          class="absolute inset-x-0 bottom-0 rounded-t-[2rem] bg-white p-5 shadow-2xl sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[2rem]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-booking-title"
        >
          <form [formGroup]="form" (ngSubmit)="submit()">
            <h2 id="cancel-booking-title" class="text-2xl font-black tracking-tight text-slate-950">
              Cancelar reserva
            </h2>
            <p class="mt-2 text-sm leading-6 text-slate-600">
              Esta accion notificara a la otra parte cuando las notificaciones esten activas.
            </p>

            <label for="cancel-reason" class="mt-5 block text-sm font-bold text-slate-800">
              Motivo opcional
            </label>
            <textarea
              id="cancel-reason"
              class="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              formControlName="reason"
            ></textarea>

            <div class="mt-4">
              <app-alert [message]="errorMessage()" variant="danger" />
            </div>

            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                class="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline focus:outline-2 focus:outline-indigo-600"
                (click)="closed.emit()"
              >
                Cerrar
              </button>
              <button
                type="submit"
                class="inline-flex min-h-11 items-center justify-center rounded-md bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 focus:outline focus:outline-2 focus:outline-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="loading()"
              >
                {{ loading() ? 'Cancelando...' : 'Cancelar reserva' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingCancelDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(BookingsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  readonly booking = input<Booking | null>(null);

  readonly closed = output<void>();
  readonly bookingUpdated = output<Booking>();

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    reason: [''],
  });

  submit(): void {
    const booking = this.booking();
    if (!booking || this.loading()) return;

    const reason = this.form.getRawValue().reason.trim();
    this.errorMessage.set(null);
    this.loading.set(true);

    this.api
      .cancelBooking(booking.id, { reason: reason || null })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.bookingUpdated.emit(response.booking);
          this.form.reset({ reason: '' }, { emitEvent: false });
          this.closed.emit();
        },
        error: (error: unknown) => this.errorMessage.set(bookingErrorMessage(error)),
      });
  }
}
