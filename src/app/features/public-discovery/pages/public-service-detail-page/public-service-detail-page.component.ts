import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { MapboxMapComponent } from '../../../../shared/location/components/mapbox-map/mapbox-map.component';
import { MapMarker } from '../../../../shared/location/models/location.models';
import { PublicAvailabilityPreviewComponent } from '../../components/public-availability-preview/public-availability-preview.component';
import { PublicCompanyBadgeComponent } from '../../components/public-company-badge/public-company-badge.component';
import { PublicModalityBadgeComponent } from '../../components/public-modality-badge/public-modality-badge.component';
import { PublicProfessionalCardComponent } from '../../components/public-professional-card/public-professional-card.component';
import { PublicRatingBadgeComponent } from '../../components/public-rating-badge/public-rating-badge.component';
import { PublicDiscoveryApi } from '../../data-access/public-discovery.api';
import { PublicService, PublicServiceResponse } from '../../models/public-discovery.models';
import { formatPrice } from '../../utils/price-format.util';

@Component({
  selector: 'app-public-service-detail-page',
  imports: [
    RouterLink,
    AppEmptyStateComponent,
    MapboxMapComponent,
    PublicAvailabilityPreviewComponent,
    PublicCompanyBadgeComponent,
    PublicModalityBadgeComponent,
    PublicProfessionalCardComponent,
    PublicRatingBadgeComponent,
  ],
  templateUrl: './public-service-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicServiceDetailPageComponent implements OnInit {
  private readonly api = inject(PublicDiscoveryApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly service = signal<PublicService | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('serviceId')),
        switchMap((serviceId) => this.fetchService(serviceId)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        this.service.set(response?.service ?? null);
      });
  }

  price(value: string | number): string {
    return formatPrice(value);
  }

  showLocation(service: PublicService): boolean {
    return service.modality !== 'remota' && !!service.address;
  }

  hasMapLocation(service: PublicService): boolean {
    return service.latitude !== null && service.longitude !== null;
  }

  serviceMarker(service: PublicService): MapMarker[] {
    if (!this.hasMapLocation(service)) return [];

    return [
      {
        id: service.id,
        coordinates: {
          latitude: Number(service.latitude),
          longitude: Number(service.longitude),
        },
        title: service.name,
        subtitle: service.address,
      },
    ];
  }

  private fetchService(serviceId: string | null) {
    this.loading.set(true);
    this.errorMessage.set(null);

    if (!serviceId) {
      this.loading.set(false);
      this.errorMessage.set('Servicio no encontrado o ya no esta disponible.');
      return of<PublicServiceResponse | null>(null);
    }

    return this.api.showService(serviceId).pipe(
      catchError((error: unknown) => {
        this.errorMessage.set(this.errorFrom(error));
        return of<PublicServiceResponse | null>(null);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  private errorFrom(error: unknown): string {
    if (error instanceof ApiClientError && error.status === 404) {
      return 'Servicio no encontrado o ya no esta disponible.';
    }

    return 'No pudimos cargar el servicio.';
  }
}
