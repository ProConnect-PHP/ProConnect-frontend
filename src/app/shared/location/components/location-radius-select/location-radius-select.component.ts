import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { LocationRadiusKm } from '../../models/location.models';

@Component({
  selector: 'app-location-radius-select',
  template: `
    <label class="block text-sm font-semibold text-slate-800" [attr.for]="selectId()">
      Radio
    </label>
    <select
      [id]="selectId()"
      class="mt-2 min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      [value]="radiusKm()"
      [disabled]="disabled()"
      (change)="onRadiusChange($event)"
    >
      @for (option of options; track option) {
        <option [value]="option">{{ option }} km</option>
      }
    </select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationRadiusSelectComponent {
  readonly radiusKm = input<LocationRadiusKm>(20);
  readonly disabled = input(false);
  readonly selectId = input('location-radius');
  readonly radiusChanged = output<LocationRadiusKm>();

  readonly options: LocationRadiusKm[] = [5, 10, 20, 50, 100];

  onRadiusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.radiusChanged.emit(Number(select.value) as LocationRadiusKm);
  }
}
