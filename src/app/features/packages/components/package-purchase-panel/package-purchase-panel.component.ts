import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { formatMoney } from '../../../../shared/utils/money.util';
import { PackagesApi } from '../../data-access/packages.api';
import { mapPackageApiError } from '../../data-access/packages-error.mapper';
import { ClientPackage, PackageProduct } from '../../data-access/packages.models';
import {
  formatPackagePricePerSession,
  formatPackageValidity,
} from '../../utils/package-format.util';

@Component({
  selector: 'app-package-purchase-panel',
  templateUrl: './package-purchase-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackagePurchasePanelComponent {
  private readonly api = inject(PackagesApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly packageProduct = input.required<PackageProduct>();

  readonly purchased = output<ClientPackage>();
  readonly closed = output<void>();

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  confirmPurchase(): void {
    if (this.submitting()) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.api
      .purchasePackage(this.packageProduct().id)
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (clientPackage) => this.purchased.emit(clientPackage),
        error: (error: unknown) => this.errorMessage.set(mapPackageApiError(error)),
      });
  }

  price(packageProduct: PackageProduct): string {
    return formatMoney(packageProduct.price, packageProduct.currency);
  }

  pricePerSession(packageProduct: PackageProduct): string {
    return formatPackagePricePerSession(
      packageProduct.price,
      packageProduct.sessions_count,
      packageProduct.currency,
    );
  }

  validity(packageProduct: PackageProduct): string {
    return formatPackageValidity(packageProduct.validity_days);
  }
}
