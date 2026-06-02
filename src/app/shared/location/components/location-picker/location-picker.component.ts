import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { MAPBOX_CONFIG } from '../../../../core/config/mapbox.config';
import { BrowserGeolocationService } from '../../data-access/browser-geolocation.service';
import { MapboxGeocodingService } from '../../data-access/mapbox-geocoding.service';
import { Coordinates, LocationRadiusKm, SelectedLocation } from '../../models/location.models';
import { coordinatesLabel, isInsideUruguay } from '../../utils/coordinates.util';
import { LocationRadiusSelectComponent } from '../location-radius-select/location-radius-select.component';
import { LocationSearchBoxComponent } from '../location-search-box/location-search-box.component';
import { MapboxMapComponent } from '../mapbox-map/mapbox-map.component';
import { MapboxMarkerPreviewComponent } from '../mapbox-marker-preview/mapbox-marker-preview.component';

@Component({
  selector: 'app-location-picker',
  imports: [
    LocationRadiusSelectComponent,
    LocationSearchBoxComponent,
    MapboxMapComponent,
    MapboxMarkerPreviewComponent,
  ],
  templateUrl: './location-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationPickerComponent {
  private readonly config = inject(MAPBOX_CONFIG);
  private readonly geolocation = inject(BrowserGeolocationService);
  private readonly geocoding = inject(MapboxGeocodingService);
  private readonly destroyRef = inject(DestroyRef);

  readonly showRadius = input(false);
  readonly showMap = input(true);
  readonly initialLocation = input<SelectedLocation | null>(null);
  readonly initialRadiusKm = input<LocationRadiusKm>(20);
  readonly disabled = input(false);
  readonly searchPlaceholder = input('Buscar barrio, ciudad o direccion...');
  readonly mapHeightClass = input('h-72 sm:h-80');

  readonly locationChanged = output<SelectedLocation>();
  readonly radiusChanged = output<LocationRadiusKm>();
  readonly cleared = output<void>();

  readonly selectedLocation = signal<SelectedLocation | null>(null);
  readonly selectedRadius = signal<LocationRadiusKm>(20);
  readonly loadingLocation = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly mapCenter = computed(() => this.selectedLocation()?.coordinates ?? this.config.defaultCenter);

  constructor() {
    effect(() => {
      this.selectedLocation.set(this.initialLocation());
    });

    effect(() => {
      this.selectedRadius.set(this.initialRadiusKm());
    });
  }

  onLocationSelected(location: SelectedLocation): void {
    this.errorMessage.set(null);
    this.selectedLocation.set(location);
    this.locationChanged.emit(location);
  }

  onRadiusChanged(radius: LocationRadiusKm): void {
    this.selectedRadius.set(radius);
    this.radiusChanged.emit(radius);
  }

  useCurrentLocation(): void {
    this.errorMessage.set(null);
    this.loadingLocation.set(true);

    this.geolocation
      .getCurrentPosition()
      .pipe(
        switchMap((coordinates) => {
          if (!isInsideUruguay(coordinates)) {
            this.errorMessage.set('Tu ubicacion actual parece estar fuera de Uruguay.');
            return of(null);
          }

          return this.locationFromCoordinates(coordinates, 'Mi ubicacion actual');
        }),
        finalize(() => this.loadingLocation.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((location) => {
        if (!location) return;
        this.onLocationSelected(location);
      });
  }

  onMapClicked(coordinates: Coordinates): void {
    if (this.disabled()) return;

    this.errorMessage.set(null);
    this.locationFromCoordinates(coordinates, 'Punto seleccionado en el mapa')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((location) => this.onLocationSelected(location));
  }

  clearLocation(): void {
    this.errorMessage.set(null);
    this.selectedLocation.set(null);
    this.cleared.emit();
  }

  private locationFromCoordinates(
    coordinates: Coordinates,
    fallbackLabel: string,
  ) {
    return this.geocoding.reverseGeocode(coordinates).pipe(
      map((suggestion) => ({
        label: suggestion?.placeName ?? `${fallbackLabel} (${coordinatesLabel(coordinates)})`,
        coordinates,
      })),
      catchError(() =>
        of({
          label: `${fallbackLabel} (${coordinatesLabel(coordinates)})`,
          coordinates,
        }),
      ),
    );
  }
}
