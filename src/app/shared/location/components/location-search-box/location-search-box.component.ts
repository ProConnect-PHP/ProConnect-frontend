import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, switchMap, tap } from 'rxjs/operators';

import { MapboxGeocodingService } from '../../data-access/mapbox-geocoding.service';
import { LocationSuggestion, SelectedLocation } from '../../models/location.models';

@Component({
  selector: 'app-location-search-box',
  imports: [ReactiveFormsModule],
  templateUrl: './location-search-box.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationSearchBoxComponent {
  private readonly geocoding = inject(MapboxGeocodingService);
  private readonly destroyRef = inject(DestroyRef);

  readonly placeholder = input('Buscar ubicacion');
  readonly value = input<string | null>(null);
  readonly disabled = input(false);
  readonly locationSelected = output<SelectedLocation>();
  readonly cleared = output<void>();

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly suggestions = signal<LocationSuggestion[]>([]);
  readonly loading = signal(false);
  readonly hasSearched = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const nextValue = this.value() ?? '';
      if (nextValue !== this.searchControl.value) {
        this.searchControl.setValue(nextValue, { emitEvent: false });
      }
    });

    effect(() => {
      if (this.disabled()) {
        this.searchControl.disable({ emitEvent: false });
      } else {
        this.searchControl.enable({ emitEvent: false });
      }
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((query) => {
          this.errorMessage.set(null);
          this.hasSearched.set(query.trim().length >= 3);
          if (query.trim().length < 3) {
            this.suggestions.set([]);
          }
        }),
        switchMap((query) => {
          const trimmed = query.trim();
          if (trimmed.length < 3) return of([]);

          this.loading.set(true);
          return this.geocoding.searchPlaces(trimmed).pipe(
            catchError(() => {
              this.errorMessage.set('No encontramos esa ubicacion.');
              return of([]);
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((suggestions) => this.suggestions.set(suggestions));
  }

  selectSuggestion(suggestion: LocationSuggestion): void {
    this.searchControl.setValue(suggestion.placeName, { emitEvent: false });
    this.suggestions.set([]);
    this.hasSearched.set(false);
    this.locationSelected.emit({
      label: suggestion.placeName,
      coordinates: suggestion.coordinates,
    });
  }

  clear(): void {
    this.searchControl.setValue('', { emitEvent: true });
    this.suggestions.set([]);
    this.hasSearched.set(false);
    this.errorMessage.set(null);
    this.cleared.emit();
  }
}
