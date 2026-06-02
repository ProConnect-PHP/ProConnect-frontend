import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import {
  PublicServiceDuration,
  PublicServiceModality,
  PublicServicesQuery,
} from '../../models/public-discovery.models';
import { modalityLabel } from '../../utils/modality-label.util';
import {
  publicServiceDurations,
  publicServiceModalities,
} from '../../utils/public-service-query.util';

@Component({
  selector: 'app-public-service-filter-bar',
  templateUrl: './public-service-filter-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicServiceFilterBarComponent {
  readonly query = input<PublicServicesQuery>({});
  readonly hasActiveFilters = input(false);
  readonly quickFilterChanged = output<PublicServicesQuery>();
  readonly openFilters = output<void>();
  readonly clearFilters = output<void>();

  readonly modalities = publicServiceModalities;
  readonly durations = publicServiceDurations;

  readonly hasPriceFilter = computed(() => {
    const query = this.query();
    const hasMinPrice = query.min_price !== null && query.min_price !== undefined;
    const hasMaxPrice = query.max_price !== null && query.max_price !== undefined;

    return hasMinPrice || hasMaxPrice;
  });

  readonly hasLocationFilter = computed(() => {
    const query = this.query();
    return (
      query.latitude !== null &&
      query.latitude !== undefined &&
      query.longitude !== null &&
      query.longitude !== undefined
    );
  });

  readonly priceLabel = computed(() => {
    const query = this.query();
    if (query.min_price !== null && query.min_price !== undefined && query.max_price !== null && query.max_price !== undefined) {
      return `$${query.min_price} - $${query.max_price}`;
    }
    if (query.min_price !== null && query.min_price !== undefined) return `Desde $${query.min_price}`;
    if (query.max_price !== null && query.max_price !== undefined) return `Hasta $${query.max_price}`;
    return 'Precio';
  });

  readonly locationLabel = computed(() => {
    const query = this.query();
    if (query.latitude === null || query.latitude === undefined || query.longitude === null || query.longitude === undefined) {
      return 'Ubicacion';
    }
    return `Ubicacion - ${query.radius_km ?? 20} km`;
  });

  modalityLabel(modality: PublicServiceModality): string {
    return modalityLabel(modality);
  }

  onModalityChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.quickFilterChanged.emit({
      modality: select.value ? (select.value as PublicServiceModality) : null,
    });
  }

  onDurationChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.quickFilterChanged.emit({
      duration_minutes: select.value ? (Number(select.value) as PublicServiceDuration) : null,
    });
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.quickFilterChanged.emit({
      available_date: input.value || null,
    });
  }

  toggleVerified(): void {
    this.quickFilterChanged.emit({
      is_verified: this.query().is_verified ? null : true,
    });
  }
}
