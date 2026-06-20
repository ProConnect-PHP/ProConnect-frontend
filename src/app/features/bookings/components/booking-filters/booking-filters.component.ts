import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { BookingContext, BookingListFilter } from '../../models/booking.models';

type FilterOption = {
  value: BookingListFilter;
  label: string;
};

const clientFilters: FilterOption[] = [
  { value: 'upcoming', label: 'Proximas' },
  { value: 'past', label: 'Pasadas' },
  { value: 'cancelled', label: 'Canceladas' },
  { value: 'all', label: 'Todas' },
];

const professionalFilters: FilterOption[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'cancelled', label: 'Canceladas' },
];

@Component({
  selector: 'app-booking-filters',
  template: `
    <section
      class="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[1fr_auto] md:items-center"
      aria-label="Filtros de reservas"
    >
      <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        @for (option of options(); track option.value) {
          <button
            type="button"
            class="inline-flex min-h-10 items-center justify-center rounded-full border px-3 py-2 text-center text-sm font-bold transition focus:outline focus:outline-2 focus:outline-indigo-600 sm:px-4"
            [class.border-slate-950]="activeFilter() === option.value"
            [class.bg-slate-950]="activeFilter() === option.value"
            [class.text-white]="activeFilter() === option.value"
            [class.border-slate-200]="activeFilter() !== option.value"
            [class.bg-white]="activeFilter() !== option.value"
            [class.text-slate-700]="activeFilter() !== option.value"
            (click)="filterChanged.emit(option.value)"
          >
            {{ option.label }}
          </button>
        }
      </div>

      @if (context() === 'professional') {
        <label class="grid gap-1 text-sm font-semibold text-slate-700 sm:flex sm:items-center sm:gap-2">
          <span>Fecha</span>

          <input
            type="date"
            class="min-h-11 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:w-auto"
            [value]="dateFilter() ?? ''"
            (change)="onDateChanged($event)"
          />
        </label>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingFiltersComponent {
  readonly context = input<BookingContext>('client');
  readonly activeFilter = input<BookingListFilter>('upcoming');
  readonly dateFilter = input<string | null>(null);

  readonly filterChanged = output<BookingListFilter>();
  readonly dateChanged = output<string | null>();

  options(): FilterOption[] {
    return this.context() === 'professional' ? professionalFilters : clientFilters;
  }

  onDateChanged(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dateChanged.emit(input.value || null);
  }
}
