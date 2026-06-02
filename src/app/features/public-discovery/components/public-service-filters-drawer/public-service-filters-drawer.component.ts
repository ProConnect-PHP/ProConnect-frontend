import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { LocationPickerComponent } from '../../../../shared/location/components/location-picker/location-picker.component';
import { LocationRadiusKm, SelectedLocation } from '../../../../shared/location/models/location.models';
import { coordinatesLabel } from '../../../../shared/location/utils/coordinates.util';
import {
  PublicServiceDuration,
  PublicServiceModality,
  PublicServicesQuery,
} from '../../models/public-discovery.models';
import {
  publicServiceDurations,
  publicServiceModalities,
} from '../../utils/public-service-query.util';

@Component({
  selector: 'app-public-service-filters-drawer',
  imports: [ReactiveFormsModule, LocationPickerComponent],
  templateUrl: './public-service-filters-drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicServiceFiltersDrawerComponent {
  private readonly fb = inject(FormBuilder);

  readonly open = input(false);
  readonly query = input<PublicServicesQuery>({});
  readonly closed = output<void>();
  readonly filtersApplied = output<PublicServicesQuery>();
  readonly filtersCleared = output<void>();

  readonly selectedLocation = signal<SelectedLocation | null>(null);
  readonly selectedRadius = signal<LocationRadiusKm>(20);
  readonly pickerLocation = computed(() => this.selectedLocation());
  readonly modalities = publicServiceModalities;
  readonly durations = publicServiceDurations;

  readonly form = this.fb.group({
    modality: this.fb.control<PublicServiceModality | ''>(''),
    min_price: this.fb.control<number | null>(null),
    max_price: this.fb.control<number | null>(null),
    duration_minutes: this.fb.control<PublicServiceDuration | ''>(''),
    available_date: this.fb.control<string>(''),
    is_verified: this.fb.control(false, { nonNullable: true }),
  });

  constructor() {
    effect(() => this.patchFromQuery(this.query()));
  }

  applyFilters(): void {
    const value = this.form.getRawValue();
    const selectedLocation = this.selectedLocation();

    this.filtersApplied.emit({
      modality: value.modality || null,
      min_price: numberOrNull(value.min_price),
      max_price: numberOrNull(value.max_price),
      duration_minutes: value.duration_minutes || null,
      available_date: stringOrNull(value.available_date),
      is_verified: value.is_verified ? true : null,
      latitude: selectedLocation?.coordinates.latitude ?? null,
      longitude: selectedLocation?.coordinates.longitude ?? null,
      radius_km: selectedLocation ? this.selectedRadius() : null,
    });
    this.closed.emit();
  }

  clearAll(): void {
    this.form.reset(
      {
        modality: '',
        min_price: null,
        max_price: null,
        duration_minutes: '',
        available_date: '',
        is_verified: false,
      },
      { emitEvent: false },
    );
    this.selectedLocation.set(null);
    this.selectedRadius.set(20);
    this.filtersCleared.emit();
    this.closed.emit();
  }

  onLocationChanged(location: SelectedLocation): void {
    this.selectedLocation.set(location);
  }

  onRadiusChanged(radius: LocationRadiusKm): void {
    this.selectedRadius.set(radius);
  }

  clearLocation(): void {
    this.selectedLocation.set(null);
    this.selectedRadius.set(20);
  }

  private patchFromQuery(query: PublicServicesQuery): void {
    this.form.patchValue(
      {
        modality: query.modality ?? '',
        min_price: query.min_price ?? null,
        max_price: query.max_price ?? null,
        duration_minutes: query.duration_minutes ?? '',
        available_date: query.available_date ?? '',
        is_verified: query.is_verified ?? false,
      },
      { emitEvent: false },
    );

    this.selectedRadius.set(toRadius(query.radius_km) ?? 20);

    if (query.latitude === null || query.latitude === undefined || query.longitude === null || query.longitude === undefined) {
      this.selectedLocation.set(null);
      return;
    }

    const coordinates = {
      latitude: query.latitude,
      longitude: query.longitude,
    };

    this.selectedLocation.set({
      label: `Ubicacion seleccionada (${coordinatesLabel(coordinates)})`,
      coordinates,
    });
  }
}

function numberOrNull(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

function toRadius(value: number | null | undefined): LocationRadiusKm | null {
  const allowed: LocationRadiusKm[] = [5, 10, 20, 50, 100];
  return allowed.includes(value as LocationRadiusKm) ? (value as LocationRadiusKm) : null;
}
