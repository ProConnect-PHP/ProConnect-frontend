import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { formatMoney } from '../../../../shared/utils/money.util';
import { PackageProduct } from '../../data-access/packages.models';
import {
  formatPackagePricePerSession,
  formatPackageValidity,
} from '../../utils/package-format.util';

type PackageProductCardVariant = 'public' | 'professional';

@Component({
  selector: 'app-package-product-card',
  templateUrl: './package-product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageProductCardComponent {
  readonly packageProduct = input.required<PackageProduct>();
  readonly variant = input<PackageProductCardVariant>('public');
  readonly showService = input(true);
  readonly showActions = input(true);

  readonly purchaseClicked = output<PackageProduct>();
  readonly editClicked = output<PackageProduct>();
  readonly deleteClicked = output<PackageProduct>();
  readonly toggleActiveClicked = output<PackageProduct>();

  readonly price = computed(() =>
    formatMoney(this.packageProduct().price, this.packageProduct().currency),
  );
  readonly pricePerSession = computed(() =>
    formatPackagePricePerSession(
      this.packageProduct().price,
      this.packageProduct().sessions_count,
      this.packageProduct().currency,
    ),
  );
  readonly validity = computed(() => formatPackageValidity(this.packageProduct().validity_days));
}
