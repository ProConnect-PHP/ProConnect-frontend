import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SelectedLocation } from '../../models/location.models';
import { coordinatesLabel } from '../../utils/coordinates.util';

@Component({
  selector: 'app-mapbox-marker-preview',
  template: `
    @if (location(); as selectedLocation) {
      <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p class="text-sm font-bold text-emerald-950">Ubicación seleccionada</p>
        <p class="mt-1 text-sm leading-6 text-emerald-900">{{ selectedLocation.label }}</p>
        @if (showCoordinates()) {
          <p class="mt-1 text-xs font-medium text-emerald-800">
            {{ coordinates(selectedLocation) }}
          </p>
        }
      </div>
    } @else {
      <div class="rounded-2xl border border-slate-200 bg-white p-4">
        <p class="text-sm font-bold text-slate-900">Sin ubicación seleccionada</p>
        <p class="mt-1 text-sm leading-6 text-slate-600">
          @if (showMapHint()) {
            Buscá una dirección, usá tu ubicación actual o marcá un punto en el mapa.
          } @else {
            Buscá una dirección o usá tu ubicación actual.
          }
        </p>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapboxMarkerPreviewComponent {
  readonly location = input<SelectedLocation | null>(null);
  readonly showCoordinates = input(false);
  readonly showMapHint = input(true);

  coordinates(location: SelectedLocation): string {
    return coordinatesLabel(location.coordinates);
  }
}
