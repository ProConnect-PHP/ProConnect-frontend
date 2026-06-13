import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';

import { Payment, PayableType, PaymentStatusResult } from '../../data-access/payments.models';
import { PaymentCheckoutStore } from '../../state/payment-checkout.store';
import { PaymentProviderSelectorComponent } from '../payment-provider-selector/payment-provider-selector.component';
import { SimulatedCheckoutPanelComponent } from '../simulated-checkout-panel/simulated-checkout-panel.component';

@Component({
  selector: 'app-payment-checkout-panel',
  imports: [PaymentProviderSelectorComponent, SimulatedCheckoutPanelComponent],
  providers: [PaymentCheckoutStore],
  templateUrl: './payment-checkout-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentCheckoutPanelComponent {
  readonly store = inject(PaymentCheckoutStore);

  readonly payableType = input.required<PayableType>();
  readonly payableId = input.required<string>();
  readonly amountLabel = input<string | null>(null);
  readonly title = input('Pagar');

  readonly checkoutStarted = output<void>();
  readonly paymentCompleted = output<Payment>();

  startCheckout(): void {
    this.checkoutStarted.emit();
    this.store.startCheckout(this.payableType(), this.payableId());
  }

  onSimulatorStatus(result: PaymentStatusResult): void {
    this.store.applyStatus(result);

    if (result.payment) {
      this.paymentCompleted.emit(result.payment);
    }
  }
}
