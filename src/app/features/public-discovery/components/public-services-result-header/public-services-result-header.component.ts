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
    <header class="mb-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
      <div class="min-w-0">
        <p class="text-xs font-bold uppercase tracking-wide text-indigo-600 sm:text-sm">
          Resultados
        </p>

        <h2 class="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          {{ total() }} servicios encontrados
        </h2>

        <p class="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
          Ajusta los filtros para encontrar la mejor opcion.
        </p>
      </div>

      <div class="grid gap-3 sm:min-w-72 md:min-w-[24rem]">
        <div
          class="grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50 p-1"
          aria-label="Modo de visualizacion"
        >
          <button
            type="button"
            class="min-h-11 rounded-xl px-4 py-2 text-sm font-bold transition hover:text-slate-900 focus:outline focus:outline-2 focus:outline-indigo-600"
            [class.bg-white]="viewMode() === 'list'"
            [class.text-slate-950]="viewMode() === 'list'"
            [class.shadow-sm]="viewMode() === 'list'"
            [class.text-slate-500]="viewMode() !== 'list'"
            [attr.aria-pressed]="viewMode() === 'list'"
            (click)="viewModeChanged.emit('list')"
          >
            Lista
          </button>

          <button
            type="button"
            class="min-h-11 rounded-xl px-4 py-2 text-sm font-bold transition hover:text-slate-900 focus:outline focus:outline-2 focus:outline-indigo-600"
            [class.bg-white]="viewMode() === 'map'"
            [class.text-slate-950]="viewMode() === 'map'"
            [class.shadow-sm]="viewMode() === 'map'"
            [class.text-slate-500]="viewMode() !== 'map'"
            [attr.aria-pressed]="viewMode() === 'map'"
            (click)="viewModeChanged.emit('map')"
          >
            Mapa
          </button>
        </div>

        <app-public-service-sort-select
          [sort]="sort()"
          (sortChange)="sortChanged.emit($event)"
        />
      </div>
    </header>
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
