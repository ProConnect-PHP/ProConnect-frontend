import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SelectedLocation } from '../../models/location.models';
import { coordinatesLabel } from '../../utils/coordinates.util';

@Component({
  selector: 'app-mapbox-marker-preview',
  template: `
    @if (location(); as selectedLocation) {
      <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
        <p class="text-sm font-semibold text-emerald-950">Ubicacion seleccionada</p>
        <p class="mt-1 text-sm leading-6 text-emerald-900">{{ selectedLocation.label }}</p>
        <p class="mt-1 text-xs font-medium text-emerald-800">
          {{ coordinates(selectedLocation) }}
        </p>
      </div>
    } @else {
      <div class="rounded-2xl border border-slate-200 bg-white p-3">
        <p class="text-sm font-semibold text-slate-900">Sin ubicacion seleccionada</p>
        <p class="mt-1 text-sm leading-6 text-slate-600">
          Busca una ubicacion, usa tu ubicacion actual o marca un punto en el mapa.
        </p>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapboxMarkerPreviewComponent {
  readonly location = input<SelectedLocation | null>(null);

  coordinates(location: SelectedLocation): string {
    return coordinatesLabel(location.coordinates);
  }
}
