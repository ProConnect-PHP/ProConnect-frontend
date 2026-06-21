import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnChanges,
  SimpleChanges,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppModalComponent } from '../../../../shared/ui/modal/modal.component';
import { BookingsApi } from '../../data-access/bookings.api';
import { Booking } from '../../models/booking.models';
import { completeBookingErrorMessage } from '../../utils/booking-error-message.util';

@Component({
  selector: 'app-booking-complete-dialog',
  imports: [AppAlertComponent, AppModalComponent],
  template: `
    <app-modal
      [open]="open()"
      title="Finalizar sesión"
      description="¿Confirmás que esta sesión ocurrió? Esta acción marcará la reserva como finalizada y habilitará la reseña del cliente."
      titleId="complete-booking-title"
      descriptionId="complete-booking-description"
      (close)="requestClose()"
    >
      <app-alert [message]="errorMessage()" variant="danger" />

      <div class="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline focus:outline-2 focus:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          [disabled]="loading()"
          (click)="requestClose()"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus:outline focus:outline-2 focus:outline-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          [disabled]="loading()"
          (click)="submit()"
        >
          {{ loading() ? 'Finalizando...' : 'Finalizar sesión' }}
        </button>
      </div>
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingCompleteDialogComponent implements OnChanges {
  private readonly api = inject(BookingsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  readonly booking = input<Booking | null>(null);

  readonly closed = output<void>();
  readonly bookingUpdated = output<Booking>();

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue) this.errorMessage.set(null);
  }

  requestClose(): void {
    if (!this.loading()) this.closed.emit();
  }

  submit(): void {
    const booking = this.booking();
    if (!booking || this.loading()) return;

    this.errorMessage.set(null);
    this.loading.set(true);

    this.api
      .completeBooking(booking.id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.bookingUpdated.emit(response.booking);
          this.closed.emit();
        },
        error: (error: unknown) => this.errorMessage.set(completeBookingErrorMessage(error)),
      });
  }
}
