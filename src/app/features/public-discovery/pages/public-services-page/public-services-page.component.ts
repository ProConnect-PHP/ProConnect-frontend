import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { PublicDiscoveryApi } from '../../data-access/public-discovery.api';
import {
  PublicService,
  PublicServiceFilterKey,
  PublicServiceSort,
  PublicServicesMeta,
  PublicServicesQuery,
  PublicServicesResponse,
  PublicServicesViewMode,
} from '../../models/public-discovery.models';
import {
  cleanPublicServicesQuery,
  publicServicesQueryFromParams,
  validatePublicServicesQuery,
} from '../../utils/public-service-query.util';
import { PublicActiveFiltersComponent } from '../../components/public-active-filters/public-active-filters.component';
import { MarketplaceHeroComponent } from '../../components/marketplace-hero/marketplace-hero.component';
import { PublicPaginationComponent } from '../../components/public-pagination/public-pagination.component';
import { PublicServiceFilterBarComponent } from '../../components/public-service-filter-bar/public-service-filter-bar.component';
import { PublicServiceFiltersDrawerComponent } from '../../components/public-service-filters-drawer/public-service-filters-drawer.component';
import { PublicServicesListComponent } from '../../components/public-services-list/public-services-list.component';
import { PublicServicesMapLayoutComponent } from '../../components/public-services-map-layout/public-services-map-layout.component';
import { PublicServicesResultHeaderComponent } from '../../components/public-services-result-header/public-services-result-header.component';

const defaultQuery: PublicServicesQuery = {
  page: 1,
  per_page: 12,
  sort: 'recent',
};

@Component({
  selector: 'app-public-services-page',
  imports: [
    AppAlertComponent,
    PublicActiveFiltersComponent,
    MarketplaceHeroComponent,
    PublicPaginationComponent,
    PublicServiceFilterBarComponent,
    PublicServiceFiltersDrawerComponent,
    PublicServicesListComponent,
    PublicServicesMapLayoutComponent,
    PublicServicesResultHeaderComponent,
  ],
  templateUrl: './public-services-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicServicesPageComponent implements OnInit {
  private readonly api = inject(PublicDiscoveryApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly services = signal<PublicService[]>([]);
  readonly meta = signal<PublicServicesMeta | null>(null);
  readonly query = signal<PublicServicesQuery>(defaultQuery);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly validationMessage = signal<string | null>(null);
  readonly viewMode = signal<PublicServicesViewMode>('list');
  readonly filtersDrawerOpen = signal(false);
  readonly selectedMapServiceId = signal<string | number | null>(null);

  readonly hasActiveFilters = computed(() => {
    const query = this.query();
    const hasMinPrice = query.min_price !== null && query.min_price !== undefined;
    const hasMaxPrice = query.max_price !== null && query.max_price !== undefined;
    const hasLatitude = query.latitude !== null && query.latitude !== undefined;
    const hasLongitude = query.longitude !== null && query.longitude !== undefined;
    const hasRadius = query.radius_km !== null && query.radius_km !== undefined;

    return Boolean(
      query.search ||
        query.modality ||
        hasMinPrice ||
        hasMaxPrice ||
        query.duration_minutes ||
        query.available_date ||
        hasLatitude ||
        hasLongitude ||
        hasRadius
    );
  });

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => ({ ...defaultQuery, ...publicServicesQueryFromParams(params) })),
        switchMap((query) => this.fetchServices(query)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        if (!response) return;
        this.services.set(response.services);
        this.meta.set(response.meta);
      });
  }

  onSearchChange(search: string | null): void {
    this.updateQuery({ search });
  }

  onFiltersChange(filters: PublicServicesQuery): void {
    this.updateQuery(filters);
  }

  applyAdvancedFilters(filters: PublicServicesQuery): void {
    this.updateQuery(filters);
  }

  onSortChange(sort: PublicServiceSort): void {
    this.updateQuery({ sort });
  }

  onPageChange(page: number): void {
    this.updateQuery({ page }, false);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  setViewMode(mode: PublicServicesViewMode): void {
    this.viewMode.set(mode);
  }

  openFiltersDrawer(): void {
    this.filtersDrawerOpen.set(true);
  }

  closeFiltersDrawer(): void {
    this.filtersDrawerOpen.set(false);
  }

  onMapServiceSelected(serviceId: string | number): void {
    this.selectedMapServiceId.set(serviceId);
  }

  clearFilters(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: cleanPublicServicesQuery(defaultQuery),
    });
  }

  removeFilter(filter: PublicServiceFilterKey | 'price' | 'location'): void {
    const patch = this.patchForRemovedFilter(filter);
    this.updateQuery(patch);
  }

  private fetchServices(query: PublicServicesQuery) {
    this.query.set(query);
    this.errorMessage.set(null);

    const validationMessage = validatePublicServicesQuery(query);
    this.validationMessage.set(validationMessage);

    if (validationMessage) {
      this.loading.set(false);
      this.services.set([]);
      this.meta.set(null);
      return of<PublicServicesResponse | null>(null);
    }

    this.loading.set(true);

    return this.api.listServices(query).pipe(
      catchError((error: unknown) => {
        this.services.set([]);
        this.meta.set(null);
        this.errorMessage.set(this.errorFrom(error));
        return of<PublicServicesResponse | null>(null);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  private updateQuery(patch: PublicServicesQuery, resetPage = true): void {
    const nextQuery: PublicServicesQuery = {
      ...this.query(),
      ...patch,
      page: resetPage ? 1 : (patch.page ?? this.query().page ?? 1),
      per_page: this.query().per_page ?? defaultQuery.per_page,
      sort: patch.sort ?? this.query().sort ?? defaultQuery.sort,
    };

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: cleanPublicServicesQuery(nextQuery),
    });
  }

  private patchForRemovedFilter(filter: PublicServiceFilterKey | 'price' | 'location'): PublicServicesQuery {
    switch (filter) {
      case 'search':
        return { search: null };
      case 'modality':
        return { modality: null };
      case 'min_price':
        return { min_price: null };
      case 'max_price':
        return { max_price: null };
      case 'duration_minutes':
        return { duration_minutes: null };
      case 'available_date':
        return { available_date: null };
      case 'latitude':
        return { latitude: null };
      case 'longitude':
        return { longitude: null };
      case 'radius_km':
        return { radius_km: null };
      case 'price':
        return {
          min_price: null,
          max_price: null,
        };
      case 'location':
        return {
          latitude: null,
          longitude: null,
          radius_km: null,
        };
    }
  }

  private errorFrom(error: unknown): string {
    if (error instanceof ApiClientError && error.status === 422) {
      return 'No pudimos cargar los servicios. Revisa los filtros e intenta nuevamente.';
    }

    return 'No pudimos cargar los servicios. Revisa los filtros e intenta nuevamente.';
  }
}
