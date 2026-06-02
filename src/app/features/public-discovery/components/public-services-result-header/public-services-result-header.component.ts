import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import {
  PublicServiceSort,
  PublicServicesViewMode,
} from '../../models/public-discovery.models';
import { PublicServiceSortSelectComponent } from '../public-service-sort-select/public-service-sort-select.component';

@Component({
  selector: 'app-public-services-result-header',
  imports: [PublicServiceSortSelectComponent],
  template: `
    <div class="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-indigo-600">Resultados</p>
        <h2 class="mt-1 text-2xl font-black tracking-tight text-slate-950">
          {{ total() }} servicios encontrados
        </h2>
        <p class="mt-1 text-sm text-slate-500">
          Ajusta los filtros para encontrar la mejor opcion.
        </p>
      </div>

      <div class="flex flex-wrap items-end gap-3">
        <div class="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            class="min-h-10 rounded-xl px-4 py-2 text-sm font-semibold transition hover:text-slate-900 focus:outline focus:outline-2 focus:outline-indigo-600"
            [class.bg-white]="viewMode() === 'list'"
            [class.text-slate-950]="viewMode() === 'list'"
            [class.shadow-sm]="viewMode() === 'list'"
            [class.text-slate-500]="viewMode() !== 'list'"
            (click)="viewModeChanged.emit('list')"
          >
            Lista
          </button>
          <button
            type="button"
            class="min-h-10 rounded-xl px-4 py-2 text-sm font-semibold transition hover:text-slate-900 focus:outline focus:outline-2 focus:outline-indigo-600"
            [class.bg-white]="viewMode() === 'map'"
            [class.text-slate-950]="viewMode() === 'map'"
            [class.shadow-sm]="viewMode() === 'map'"
            [class.text-slate-500]="viewMode() !== 'map'"
            (click)="viewModeChanged.emit('map')"
          >
            Mapa
          </button>
        </div>

        <div class="min-w-56">
          <app-public-service-sort-select
            [sort]="sort()"
            (sortChange)="sortChanged.emit($event)"
          />
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicServicesResultHeaderComponent {
  readonly total = input(0);
  readonly viewMode = input<PublicServicesViewMode>('list');
  readonly sort = input<PublicServiceSort>('recent');

  readonly viewModeChanged = output<PublicServicesViewMode>();
  readonly sortChanged = output<PublicServiceSort>();
}
