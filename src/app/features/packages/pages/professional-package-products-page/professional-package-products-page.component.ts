import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ApiClientError } from '../../../../core/http/models/api-error.model';
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
  selector: 'app-professional-package-products-page',
  imports: [
    RouterLink,
    AppAlertComponent,
    AppEmptyStateComponent,
    AppLoadingSpinnerComponent,
    PackageProductCardComponent,
    PackageProductFormComponent,
  ],
  templateUrl: './professional-package-products-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalPackageProductsPageComponent implements OnInit {
  private readonly api = inject(PackagesApi);
  private readonly servicesApi = inject(ServicesApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly packageProducts = signal<PackageProduct[]>([]);
  readonly services = signal<Service[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly profileRequired = signal(false);
  readonly showForm = signal(false);
  readonly editingPackageProduct = signal<PackageProduct | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPage();
  }

  loadPage(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.profileRequired.set(false);

    forkJoin({
      packageProducts: this.api.listProfessionalPackageProducts({ page: 1, per_page: 50 }),
      services: this.servicesApi.mine(),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ packageProducts, services }) => {
          this.packageProducts.set(packageProducts.package_products);
          this.services.set(services.services);
        },
        error: (error: unknown) => {
          this.errorMessage.set(mapPackageApiError(error, 'No pudimos cargar tus paquetes.'));
          this.profileRequired.set(
            error instanceof ApiClientError && error.type === 'ProfessionalProfileRequired',
          );
        },
      });
  }

  startCreate(): void {
    this.editingPackageProduct.set(null);
    this.showForm.set(true);
    this.errorMessage.set(null);
  }

  startEdit(packageProduct: PackageProduct): void {
    this.editingPackageProduct.set(packageProduct);
    this.showForm.set(true);
    this.errorMessage.set(null);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingPackageProduct.set(null);
  }

  savePackageProduct(payload: StorePackageProductPayload): void {
    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const editingPackageProduct = this.editingPackageProduct();
    const request = editingPackageProduct
      ? this.api.updateProfessionalPackageProduct(editingPackageProduct.id, payload)
      : this.api.createProfessionalPackageProduct(payload);

    request
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (packageProduct) => {
          this.packageProducts.update((items) => upsertPackageProduct(items, packageProduct));
          this.successMessage.set(editingPackageProduct ? 'Paquete actualizado.' : 'Paquete creado.');
          this.cancelForm();
        },
        error: (error: unknown) => this.errorMessage.set(mapPackageApiError(error)),
      });
  }

  toggleActive(packageProduct: PackageProduct): void {
    this.api
      .updateProfessionalPackageProduct(packageProduct.id, {
        is_active: !packageProduct.is_active,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedPackageProduct) => {
          this.packageProducts.update((items) =>
            upsertPackageProduct(items, updatedPackageProduct),
          );
          this.successMessage.set(
            updatedPackageProduct.is_active ? 'Paquete activado.' : 'Paquete desactivado.',
          );
        },
        error: (error: unknown) => this.errorMessage.set(mapPackageApiError(error)),
      });
  }

  deletePackageProduct(packageProduct: PackageProduct): void {
    this.api
      .deleteProfessionalPackageProduct(packageProduct.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.packageProducts.update((items) => items.filter((item) => item.id !== packageProduct.id));
          this.successMessage.set('Paquete eliminado.');
        },
        error: (error: unknown) => this.errorMessage.set(mapPackageApiError(error)),
      });
  }
}

function upsertPackageProduct(items: PackageProduct[], packageProduct: PackageProduct): PackageProduct[] {
  const exists = items.some((item) => item.id === packageProduct.id);
  if (!exists) return [packageProduct, ...items];
  return items.map((item) => (item.id === packageProduct.id ? packageProduct : item));
}
