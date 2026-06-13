import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import { PaymentProvider } from '../../data-access/payments.models';
import { PAYMENT_SIMULATOR_ENABLED } from '../../payment.config';
import { paymentProviderLabel } from '../../utils/payment-labels.util';

@Component({
  selector: 'app-payment-provider-selector',
  templateUrl: './payment-provider-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentProviderSelectorComponent {
  private readonly simulatorEnabled = inject(PAYMENT_SIMULATOR_ENABLED);

  readonly selectedProvider = input.required<PaymentProvider>();
  readonly providerSelected = output<PaymentProvider>();

  readonly providers = computed<PaymentProvider[]>(() =>
    this.simulatorEnabled
      ? ['mercadopago', 'paypal', 'simulator']
      : ['mercadopago', 'paypal'],
  );

  label(provider: PaymentProvider): string {
    return paymentProviderLabel(provider);
  }

  description(provider: PaymentProvider): string {
    switch (provider) {
      case 'mercadopago':
        return 'Paga en Mercado Pago con sus medios disponibles.';
      case 'paypal':
        return 'Continua de forma segura en PayPal.';
      case 'simulator':
        return 'Prueba local sin cargos reales.';
    }
  }
}
