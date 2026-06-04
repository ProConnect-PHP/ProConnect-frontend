import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { ServicesApi } from '../../../services/data-access/services.api';
import { Service } from '../../../services/models/service.models';
import { PackageProductCardComponent } from '../../components/package-product-card/package-product-card.component';
import { PackageProductFormComponent } from '../../components/package-product-form/package-product-form.component';
import { PackagesApi } from '../../data-access/packages.api';
import { mapPackageApiError } from '../../data-access/packages-error.mapper';
import { PackageProduct, StorePackageProductPayload } from '../../data-access/packages.models';

@Component({
  selector: 'app-professional-package-product-detail-page',
  imports: [
    RouterLink,
    AppAlertComponent,
    AppEmptyStateComponent,
    AppLoadingSpinnerComponent,
    PackageProductCardComponent,
    PackageProductFormComponent,
  ],
  templateUrl: './professional-package-product-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalPackageProductDetailPageComponent implements OnInit {
  private readonly api = inject(PackagesApi);
  private readonly servicesApi = inject(ServicesApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly packageProduct = signal<PackageProduct | null>(null);
  readonly services = signal<Service[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly editing = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('packageProductId')),
        switchMap((packageProductId) => this.fetchPage(packageProductId)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.packageProduct.set(result?.packageProduct ?? null);
        this.services.set(result?.services ?? []);
      });
  }

  startEdit(): void {
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  savePackageProduct(payload: StorePackageProductPayload): void {
    const packageProduct = this.packageProduct();
    if (!packageProduct) return;

    this.saving.set(true);
    this.errorMessage.set(null);

    this.api
      .updateProfessionalPackageProduct(packageProduct.id, payload)
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updatedPackageProduct) => {
          this.packageProduct.set(updatedPackageProduct);
          this.editing.set(false);
          this.successMessage.set('Paquete actualizado.');
        },
        error: (error: unknown) => this.errorMessage.set(mapPackageApiError(error)),
      });
  }

  private fetchPage(packageProductId: string | null) {
    this.loading.set(true);
    this.errorMessage.set(null);

    if (!packageProductId) {
      this.loading.set(false);
      this.errorMessage.set('Paquete no encontrado.');
      return of<{ packageProduct: PackageProduct; services: Service[] } | null>(null);
    }

    return forkJoin({
      packageProduct: this.api.getProfessionalPackageProduct(packageProductId),
      services: this.servicesApi.mine().pipe(map((response) => response.services)),
    }).pipe(
      catchError((error: unknown) => {
        this.errorMessage.set(mapPackageApiError(error, 'No pudimos cargar este paquete.'));
        return of<{ packageProduct: PackageProduct; services: Service[] } | null>(null);
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
