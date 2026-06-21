import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Booking, BookingContext } from '../../models/booking.models';
import { canCompleteBooking } from '../../utils/booking-actions.util';

@Component({
  selector: 'app-booking-actions',
  template: `
    @if (hasActions()) {
      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        @if (canConfirm()) {
          <button
            type="button"
            class="inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline focus:outline-2 focus:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="loadingAction() === 'confirm'"
            (click)="confirmClicked.emit()"
          >
            {{ loadingAction() === 'confirm' ? 'Confirmando...' : 'Confirmar' }}
          </button>
        }

        @if (canComplete()) {
          <button
            type="button"
            class="inline-flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus:outline focus:outline-2 focus:outline-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="loadingAction() === 'complete'"
            (click)="completeClicked.emit()"
          >
            {{ loadingAction() === 'complete' ? 'Finalizando...' : 'Finalizar sesión' }}
          </button>
        }

        @if (canReschedule()) {
          <button
            type="button"
            class="inline-flex min-h-10 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 focus:outline focus:outline-2 focus:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="loadingAction() === 'reschedule'"
            (click)="rescheduleClicked.emit()"
          >
            Reprogramar
          </button>
        }

        @if (canCancel()) {
          <button
            type="button"
            class="inline-flex min-h-10 items-center justify-center rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50 focus:outline focus:outline-2 focus:outline-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="loadingAction() === 'cancel'"
            (click)="cancelClicked.emit()"
          >
            Cancelar
          </button>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingActionsComponent {
  readonly booking = input.required<Booking>();
  readonly context = input<BookingContext>('client');
  readonly loadingAction = input<string | null>(null);

  readonly confirmClicked = output<void>();
  readonly completeClicked = output<void>();
  readonly cancelClicked = output<void>();
  readonly rescheduleClicked = output<void>();

  readonly canConfirm = computed(
    () => this.context() === 'professional' && this.booking().status === 'pending',
  );
  readonly canComplete = computed(
    () => this.context() === 'professional' && canCompleteBooking(this.booking()),
  );
  readonly canCancel = computed(() =>
    ['pending', 'confirmed', 'paid'].includes(this.booking().status),
  );
  readonly canReschedule = computed(() =>
    ['pending', 'confirmed'].includes(this.booking().status),
  );
  readonly hasActions = computed(
    () => this.canConfirm() || this.canComplete() || this.canCancel() || this.canReschedule(),
  );
}
