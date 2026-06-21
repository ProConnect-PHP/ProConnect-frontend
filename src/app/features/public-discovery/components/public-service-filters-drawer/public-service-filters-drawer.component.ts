import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

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
import { modalityLabel } from '../../utils/modality-label.util';

@Component({
  selector: 'app-public-service-filters-drawer',
  imports: [ReactiveFormsModule, LocationPickerComponent],
  templateUrl: './public-service-filters-drawer.component.html',
  host: {
    '(document:keydown.escape)': 'closeFromKeyboard()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicServiceFiltersDrawerComponent {
  private readonly fb = inject(FormBuilder);
  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

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
  readonly activeFilterCount = computed(() => countActiveFilters(this.query()));

  readonly form = this.fb.group({
    modality: this.fb.control<PublicServiceModality | ''>(''),
    min_price: this.fb.control<number | null>(null, { validators: [Validators.min(0)] }),
    max_price: this.fb.control<number | null>(null, { validators: [Validators.min(0)] }),
    duration_minutes: this.fb.control<PublicServiceDuration | ''>(''),
    available_date: this.fb.control<string>(''),
  }, { validators: [priceRangeValidator] });

  constructor() {
    effect(() => this.patchFromQuery(this.query()));
    effect(() => {
      if (!this.open()) return;
      queueMicrotask(() => this.closeButton()?.nativeElement.focus());
    });

  }

  closeFromKeyboard(): void {
    if (this.open()) this.closed.emit();
  }

  applyFilters(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const selectedLocation = this.selectedLocation();

    this.filtersApplied.emit({
      modality: value.modality || null,
      min_price: numberOrNull(value.min_price),
      max_price: numberOrNull(value.max_price),
      duration_minutes: value.duration_minutes || null,
      available_date: stringOrNull(value.available_date),
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

  selectModality(modality: PublicServiceModality | ''): void {
    this.form.controls.modality.setValue(modality);
  }

  isModalitySelected(modality: PublicServiceModality | ''): boolean {
    return this.form.controls.modality.value === modality;
  }

  modalityLabel(modality: PublicServiceModality): string {
    return modalityLabel(modality);
  }

  private patchFromQuery(query: PublicServicesQuery): void {
    this.form.patchValue(
      {
        modality: query.modality ?? '',
        min_price: query.min_price ?? null,
        max_price: query.max_price ?? null,
        duration_minutes: query.duration_minutes ?? '',
        available_date: query.available_date ?? '',
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

function countActiveFilters(query: PublicServicesQuery): number {
  const hasPrice = query.min_price !== null && query.min_price !== undefined ||
    query.max_price !== null && query.max_price !== undefined;
  const hasLocation = query.latitude !== null && query.latitude !== undefined &&
    query.longitude !== null && query.longitude !== undefined;

  return [
    !!query.modality,
    hasPrice,
    !!query.duration_minutes,
    !!query.available_date,
    hasLocation,
  ].filter(Boolean).length;
}

function priceRangeValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as { min_price?: number | null; max_price?: number | null };
  const minPrice = numberOrNull(value.min_price);
  const maxPrice = numberOrNull(value.max_price);

  return minPrice !== null && maxPrice !== null && maxPrice < minPrice
    ? { priceRange: true }
    : null;
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
