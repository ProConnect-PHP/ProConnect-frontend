import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { MAPBOX_CONFIG } from '../../../../core/config/mapbox.config';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { MapboxMapComponent } from '../../../../shared/location/components/mapbox-map/mapbox-map.component';
import { Coordinates, MapMarker } from '../../../../shared/location/models/location.models';
import { PublicService } from '../../models/public-discovery.models';
import { PublicServiceCompactCardComponent } from '../public-service-compact-card/public-service-compact-card.component';
import { PublicServiceSkeletonComponent } from '../public-service-skeleton/public-service-skeleton.component';

@Component({
  selector: 'app-public-services-map-layout',
  imports: [
    AppEmptyStateComponent,
    MapboxMapComponent,
    PublicServiceCompactCardComponent,
    PublicServiceSkeletonComponent,
  ],
  templateUrl: './public-services-map-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicServicesMapLayoutComponent {
  private readonly config = inject(MAPBOX_CONFIG);

  readonly services = input<PublicService[]>([]);
  readonly loading = input(false);
  readonly selectedServiceId = input<string | number | null>(null);
  readonly serviceSelected = output<string | number>();
  readonly clearFilters = output<void>();

  readonly servicesWithCoordinates = computed(() =>
    this.services().filter(
      (service) => service.latitude !== null && service.longitude !== null,
    ),
  );

  readonly markers = computed<MapMarker[]>(() =>
    this.servicesWithCoordinates().map((service) => ({
      id: service.id,
      coordinates: {
        latitude: Number(service.latitude),
        longitude: Number(service.longitude),
      },
      title: service.name,
      subtitle: service.address,
    })),
  );

  readonly selectedService = computed(() => {
    const selectedId = this.selectedServiceId();
    if (selectedId === null) return this.servicesWithCoordinates()[0] ?? null;
    return this.servicesWithCoordinates().find((service) => String(service.id) === String(selectedId)) ?? null;
  });

  readonly center = computed<Coordinates>(() => {
    const selectedService = this.selectedService();
    if (selectedService && selectedService.latitude !== null && selectedService.longitude !== null) {
      return {
        latitude: Number(selectedService.latitude),
        longitude: Number(selectedService.longitude),
      };
    }

    return this.config.defaultCenter;
  });

  readonly skeletonItems = Array.from({ length: 4 }, (_value, index) => index);

  onMarkerClicked(marker: MapMarker): void {
    this.serviceSelected.emit(marker.id);
  }

  isSelected(service: PublicService): boolean {
    return String(service.id) === String(this.selectedServiceId());
  }
}
