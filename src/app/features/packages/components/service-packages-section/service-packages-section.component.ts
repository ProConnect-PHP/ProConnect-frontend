import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AuthStore } from '../../../../core/auth/services/auth.store';
import { PackagesApi } from '../../data-access/packages.api';
import { mapPackageApiError } from '../../data-access/packages-error.mapper';
import { ClientPackage, PackageProduct, ServiceId } from '../../data-access/packages.models';
import { PackageProductCardComponent } from '../package-product-card/package-product-card.component';
import { PackagePurchasePanelComponent } from '../package-purchase-panel/package-purchase-panel.component';

@Component({
  selector: 'app-service-packages-section',
  imports: [RouterLink, PackageProductCardComponent, PackagePurchasePanelComponent],
  templateUrl: './service-packages-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicePackagesSectionComponent implements OnInit {
  private readonly api = inject(PackagesApi);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly serviceId = input.required<ServiceId>();

  readonly packageProducts = signal<PackageProduct[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly selectedPackageProduct = signal<PackageProduct | null>(null);
  readonly purchasedPackage = signal<ClientPackage | null>(null);

  ngOnInit(): void {
    this.loadPackageProducts();
  }

  loadPackageProducts(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .listServicePackageProducts(this.serviceId())
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (packageProducts) => this.packageProducts.set(packageProducts),
        error: (error: unknown) =>
          this.errorMessage.set(mapPackageApiError(error, 'No pudimos cargar los paquetes.')),
      });
  }

  startPurchase(packageProduct: PackageProduct): void {
    this.successMessage.set(null);
    this.purchasedPackage.set(null);

    if (!this.authStore.isAuthenticated()) {
      void this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url,
          redirectTo: this.router.url,
        },
      });
      return;
    }

    this.selectedPackageProduct.set(packageProduct);
  }

  closePurchase(): void {
    this.selectedPackageProduct.set(null);
  }

  onPurchased(clientPackage: ClientPackage): void {
    this.selectedPackageProduct.set(null);
    this.purchasedPackage.set(clientPackage);
    this.successMessage.set('Paquete adquirido correctamente.');
  }
}
