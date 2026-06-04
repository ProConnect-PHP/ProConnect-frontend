import { TestBed } from '@angular/core/testing';

import { Booking } from '../../../bookings/models/booking.models';
import { PaymentsApi } from '../../data-access/payments.api';
import { PaymentActionCardComponent } from './payment-action-card.component';

const baseBooking: Booking = {
  id: 'booking-1',
  service_id: 'service-1',
  professional_id: 'professional-1',
  client_id: 'client-1',
  starts_at: '2026-06-02 09:00:00',
  ends_at: '2026-06-02 10:00:00',
  status: 'confirmed',
  modality: 'remota',
  price_snapshot: 1800,
  duration_minutes_snapshot: 60,
  confirmed_at: null,
  cancelled_at: null,
  paid_at: null,
  completed_at: null,
  no_show_at: null,
  cancellation_reason: null,
  reschedule_reason: null,
  created_at: '2026-06-01 12:00:00',
};

describe('PaymentActionCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentActionCardComponent],
      providers: [{ provide: PaymentsApi, useValue: {} }],
    }).compileComponents();
  });

  it('shows pay button for confirmed bookings', () => {
    const fixture = TestBed.createComponent(PaymentActionCardComponent);
    fixture.componentRef.setInput('booking', baseBooking);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Pagar reserva');
  });

  it('does not show pay button for paid bookings', () => {
    const fixture = TestBed.createComponent(PaymentActionCardComponent);
    fixture.componentRef.setInput('booking', {
      ...baseBooking,
      status: 'paid',
      paid_at: '2026-06-01 12:05:00',
    });
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Pago confirmado');
    expect(host.textContent).not.toContain('Pagar reserva');
  });
});
