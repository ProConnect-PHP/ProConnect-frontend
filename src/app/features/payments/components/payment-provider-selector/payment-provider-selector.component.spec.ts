import { TestBed } from '@angular/core/testing';

import { PaymentProvider } from '../../data-access/payments.models';
import { PAYMENT_SIMULATOR_ENABLED } from '../../payment.config';
import { PaymentProviderSelectorComponent } from './payment-provider-selector.component';

describe('PaymentProviderSelectorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentProviderSelectorComponent],
      providers: [{ provide: PAYMENT_SIMULATOR_ENABLED, useValue: false }],
    }).compileComponents();
  });

  it('emits the selected provider', () => {
    const fixture = TestBed.createComponent(PaymentProviderSelectorComponent);
    let selected: PaymentProvider | null = null;

    fixture.componentRef.setInput('selectedProvider', 'mercadopago');
    fixture.componentInstance.providerSelected.subscribe((value) => {
      selected = value;
    });
    fixture.detectChanges();

    const paypalInput = fixture.nativeElement.querySelector(
      'input[value="paypal"]',
    ) as HTMLInputElement;
    paypalInput.dispatchEvent(new Event('change'));

    expect(selected).toBe('paypal');
  });

  it('does not expose simulator in the production environment', () => {
    const fixture = TestBed.createComponent(PaymentProviderSelectorComponent);
    fixture.componentRef.setInput('selectedProvider', 'mercadopago');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).not.toContain('Simulador');
  });
});
