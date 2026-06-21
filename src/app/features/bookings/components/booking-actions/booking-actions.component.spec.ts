import { TestBed } from '@angular/core/testing';

import { Booking } from '../../models/booking.models';
import { BookingActionsComponent } from './booking-actions.component';

function createBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-1',
    service_id: 'service-1',
    professional_id: 'professional-1',
    client_id: 'client-1',
    starts_at: '2020-06-20T10:00:00',
    ends_at: '2020-06-20T11:00:00',
    status: 'confirmed',
    modality: 'remota',
    price_snapshot: 1200,
    duration_minutes_snapshot: 60,
    confirmed_at: '2020-06-19T10:00:00',
    cancelled_at: null,
    paid_at: null,
    completed_at: null,
    no_show_at: null,
    cancellation_reason: null,
    reschedule_reason: null,
    created_at: '2020-06-01T10:00:00',
    ...overrides,
  };
}

describe('BookingActionsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingActionsComponent],
    }).compileComponents();
  });

  it('shows the complete action for a completable professional booking', () => {
    const fixture = TestBed.createComponent(BookingActionsComponent);
    fixture.componentRef.setInput('booking', createBooking());
    fixture.componentRef.setInput('context', 'professional');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Finalizar sesión');
  });

  it('does not show the complete action for a non-completable booking', () => {
    const fixture = TestBed.createComponent(BookingActionsComponent);
    fixture.componentRef.setInput('booking', createBooking({ status: 'pending' }));
    fixture.componentRef.setInput('context', 'professional');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Finalizar sesión');
  });
});
