import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { formatMoney } from '../../../../shared/utils/money.util';
import { PaymentCheckoutPanelComponent } from '../../../payments/components/payment-checkout-panel/payment-checkout-panel.component';
import { Payment } from '../../../payments/data-access/payments.models';
import { PackageProduct } from '../../data-access/packages.models';
import {
  formatPackagePricePerSession,
  formatPackageValidity,
} from '../../utils/package-format.util';

@Component({
  selector: 'app-package-purchase-panel',
  imports: [PaymentCheckoutPanelComponent],
  templateUrl: './package-purchase-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackagePurchasePanelComponent {
  readonly packageProduct = input.required<PackageProduct>();

  readonly paymentCompleted = output<Payment>();
  readonly closed = output<void>();

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
