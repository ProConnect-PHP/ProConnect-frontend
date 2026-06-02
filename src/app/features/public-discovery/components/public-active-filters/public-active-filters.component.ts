import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import {
  PublicServiceFilterKey,
  PublicServiceModality,
  PublicServicesQuery,
} from '../../models/public-discovery.models';
import { modalityLabel } from '../../utils/modality-label.util';

type ActiveFilterChip = {
  key: PublicServiceFilterKey | 'price' | 'location';
  label: string;
};

@Component({
  selector: 'app-public-active-filters',
  template: `
    @if (chips().length > 0) {
      <div class="mb-5 flex flex-wrap items-center gap-2">
        @for (chip of chips(); track chip.key) {
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 focus:outline focus:outline-2 focus:outline-indigo-600"
            (click)="removeFilter.emit(chip.key)"
          >
            {{ chip.label }}
            <span aria-hidden="true">x</span>
          </button>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicActiveFiltersComponent {
  readonly query = input<PublicServicesQuery>({});
  readonly removeFilter = output<PublicServiceFilterKey | 'price' | 'location'>();

  readonly chips = computed<ActiveFilterChip[]>(() => {
    const query = this.query();
    const chips: ActiveFilterChip[] = [];

    if (query.search) chips.push({ key: 'search', label: query.search });
    if (query.modality) chips.push({ key: 'modality', label: modalityLabel(query.modality as PublicServiceModality) });
    if (query.min_price !== null && query.min_price !== undefined && query.max_price !== null && query.max_price !== undefined) {
      chips.push({ key: 'price', label: `$${query.min_price} - $${query.max_price}` });
    } else if (query.min_price !== null && query.min_price !== undefined) {
      chips.push({ key: 'price', label: `Desde $${query.min_price}` });
    } else if (query.max_price !== null && query.max_price !== undefined) {
      chips.push({ key: 'price', label: `Hasta $${query.max_price}` });
    }
    if (query.duration_minutes) chips.push({ key: 'duration_minutes', label: `${query.duration_minutes} min` });
    if (query.available_date) chips.push({ key: 'available_date', label: query.available_date });
    if (query.is_verified) chips.push({ key: 'is_verified', label: 'Verificados' });
    if (query.latitude !== null && query.latitude !== undefined && query.longitude !== null && query.longitude !== undefined) {
      chips.push({ key: 'location', label: `Ubicacion - ${query.radius_km ?? 20} km` });
    }

    return chips;
  });
}
