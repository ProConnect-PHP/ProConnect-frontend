import { ChangeDetectionStrategy, Component, output } from '@angular/core';

import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-public-services-empty-state',
  imports: [AppEmptyStateComponent],
  template: `
    <app-empty-state
      icon="SR"
      title="No encontramos servicios"
      description="Proba ajustar los filtros o buscar con otros terminos."
    >
      <button
        type="button"
        class="inline-flex min-h-10 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline focus:outline-2 focus:outline-indigo-700"
        (click)="clearFilters.emit()"
      >
        Limpiar filtros
      </button>
    </app-empty-state>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicServicesEmptyStateComponent {
  readonly clearFilters = output<void>();
}
