import { ChangeDetectionStrategy, Component, DestroyRef, OnChanges, SimpleChanges, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { toDateInputValue } from '../../../../shared/utils/date.util';
import { PublicDiscoveryApi } from '../../../public-discovery/data-access/public-discovery.api';
import { AvailabilitySlot } from '../../../public-discovery/models/public-discovery.models';
import { BookingsApi } from '../../data-access/bookings.api';
import { Booking } from '../../models/booking.models';
import { formatBookingTimeRange } from '../../utils/booking-date-format.util';
import { bookingErrorMessage } from '../../utils/booking-error-message.util';

@Component({
  selector: 'app-booking-reschedule-dialog',
  imports: [ReactiveFormsModule, AppAlertComponent, AppEmptyStateComponent],
  template: `
    @if (open() && booking()) {
      <div class="fixed inset-0 z-50">
        <button
          type="button"
          class="absolute inset-0 bg-slate-950/50"
          aria-label="Cerrar reprogramacion"
          (click)="closed.emit()"
        ></button>

        <section
          class="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-auto rounded-t-[2rem] bg-white p-5 shadow-2xl sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[2rem]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reschedule-booking-title"
        >
          <form [formGroup]="form" (ngSubmit)="submit()">
            <h2 id="reschedule-booking-title" class="text-2xl font-black tracking-tight text-slate-950">
              Reprogramar reserva
            </h2>
            <p class="mt-2 text-sm leading-6 text-slate-600">
              Elegi una fecha, selecciona un nuevo horario y confirma el cambio.
            </p>

            <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label class="grid flex-1 gap-2 text-sm font-bold text-slate-800" for="reschedule-date">
                Fecha
                <input
                  id="reschedule-date"
                  type="date"
                  class="min-h-11 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  formControlName="date"
                />
              </label>
              <button
                type="button"
                class="inline-flex min-h-11 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline focus:outline-2 focus:outline-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="loadingSlots()"
                (click)="loadSlots()"
              >
                {{ loadingSlots() ? 'Consultando...' : 'Ver horarios' }}
              </button>
            </div>

            <div class="mt-5">
              <app-alert [message]="errorMessage()" variant="danger" />
            </div>

            @if (slots().length > 0) {
              <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                @for (slot of slots(); track slot.starts_at) {
                  <button
                    type="button"
                    class="rounded-2xl border px-4 py-3 text-left text-sm font-bold transition focus:outline focus:outline-2 focus:outline-indigo-600"
                    [class.border-indigo-500]="isSelected(slot)"
                    [class.bg-indigo-100]="isSelected(slot)"
                    [class.text-indigo-900]="isSelected(slot)"
                    [class.border-slate-200]="!isSelected(slot)"
                    [class.bg-white]="!isSelected(slot)"
                    [class.text-slate-700]="!isSelected(slot)"
                    (click)="selectSlot(slot)"
                  >
                    {{ slotLabel(slot) }}
                  </button>
                }
              </div>
            } @else if (!loadingSlots() && slotsLoaded()) {
              <div class="mt-5">
                <app-empty-state
                  icon="HR"
                  title="No hay horarios disponibles para esta fecha"
                  description="Proba con otra fecha."
                />
              </div>
            }

            <label for="reschedule-reason" class="mt-5 block text-sm font-bold text-slate-800">
              Motivo opcional
            </label>
            <textarea
              id="reschedule-reason"
              class="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              formControlName="reason"
            ></textarea>

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
                class="inline-flex min-h-11 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline focus:outline-2 focus:outline-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="!selectedSlot() || loadingSubmit()"
              >
                {{ loadingSubmit() ? 'Reprogramando...' : 'Confirmar cambio' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingRescheduleDialogComponent implements OnChanges {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly publicApi = inject(PublicDiscoveryApi);
  private readonly bookingsApi = inject(BookingsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  readonly booking = input<Booking | null>(null);

  readonly closed = output<void>();
  readonly bookingUpdated = output<Booking>();

  readonly slots = signal<AvailabilitySlot[]>([]);
  readonly selectedSlot = signal<AvailabilitySlot | null>(null);
  readonly slotsLoaded = signal(false);
  readonly loadingSlots = signal(false);
  readonly loadingSubmit = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    date: [toDateInputValue(new Date()), [Validators.required]],
    reason: [''],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open']?.currentValue) return;
    const booking = this.booking();
    this.form.patchValue(
      {
        date: booking ? booking.starts_at.slice(0, 10) : toDateInputValue(new Date()),
        reason: '',
      },
      { emitEvent: false },
    );
    this.slots.set([]);
    this.selectedSlot.set(null);
    this.slotsLoaded.set(false);
    this.errorMessage.set(null);
  }

  loadSlots(): void {
    const booking = this.booking();
    if (!booking || this.form.controls.date.invalid) return;

    this.selectedSlot.set(null);
    this.errorMessage.set(null);
    this.loadingSlots.set(true);

    this.publicApi
      .getAvailabilitySlots(booking.service_id, this.form.getRawValue().date)
      .pipe(
        finalize(() => {
          this.loadingSlots.set(false);
          this.slotsLoaded.set(true);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.slots.set(response.slots),
        error: (error: unknown) => {
          this.slots.set([]);
          this.errorMessage.set(bookingErrorMessage(error));
        },
      });
  }

  selectSlot(slot: AvailabilitySlot): void {
    this.selectedSlot.set(slot);
  }

  isSelected(slot: AvailabilitySlot): boolean {
    return this.selectedSlot()?.starts_at === slot.starts_at;
  }

  slotLabel(slot: AvailabilitySlot): string {
    return formatBookingTimeRange(slot.starts_at, slot.ends_at);
  }

  submit(): void {
    const booking = this.booking();
    const selectedSlot = this.selectedSlot();
    if (!booking || !selectedSlot || this.loadingSubmit()) return;

    const reason = this.form.getRawValue().reason.trim();
    this.errorMessage.set(null);
    this.loadingSubmit.set(true);

    this.bookingsApi
      .rescheduleBooking(booking.id, {
        starts_at: selectedSlot.starts_at,
        reason: reason || null,
      })
      .pipe(
        finalize(() => this.loadingSubmit.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.bookingUpdated.emit(response.booking);
          this.closed.emit();
        },
        error: (error: unknown) => this.errorMessage.set(bookingErrorMessage(error)),
      });
  }
}
