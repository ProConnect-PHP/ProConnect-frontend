import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { PublicServiceSort } from '../../models/public-discovery.models';

@Component({
  selector: 'app-public-service-sort-select',
  template: `
    <label
      class="block text-xs font-bold uppercase tracking-wide text-slate-500"
      for="public-service-sort"
    >
      Ordenar
    </label>

    <select
      id="public-service-sort"
      class="mt-2 min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      [value]="sort()"
      (change)="onChange($event)"
    >
      <option value="recent">Mas recientes</option>
      <option value="price_asc">Precio menor</option>
      <option value="price_desc">Precio mayor</option>
      <option value="duration_asc">Duracion menor</option>
      <option value="duration_desc">Duracion mayor</option>
      <option value="rating_desc">Mejor calificados</option>
    </select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicServiceSortSelectComponent {
  readonly sort = input<PublicServiceSort>('recent');
  readonly sortChange = output<PublicServiceSort>();

  onChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.sortChange.emit(select.value as PublicServiceSort);
  }
}
