import { TestBed } from '@angular/core/testing';

import { PaymentStatusBadgeComponent } from './payment-status-badge.component';

describe('PaymentStatusBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentStatusBadgeComponent],
    }).compileComponents();
  });

  it('shows succeeded as Pagado for payments', () => {
    const fixture = TestBed.createComponent(PaymentStatusBadgeComponent);
    fixture.componentRef.setInput('status', 'succeeded');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Pagado');
  });

  it('shows failed as Fallido', () => {
    const fixture = TestBed.createComponent(PaymentStatusBadgeComponent);
    fixture.componentRef.setInput('status', 'failed');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Fallido');
  });

  it('prefers the display status supplied by the backend', () => {
    const fixture = TestBed.createComponent(PaymentStatusBadgeComponent);
    fixture.componentRef.setInput('status', 'checkout_created');
    fixture.componentRef.setInput('displayStatus', 'Esperando confirmacion de PayPal');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Esperando confirmacion de PayPal');
  });
});
