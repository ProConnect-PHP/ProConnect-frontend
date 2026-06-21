import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { BookingsApi } from '../../data-access/bookings.api';
import { Booking, BookingResponse } from '../../models/booking.models';
import { BookingCompleteDialogComponent } from './booking-complete-dialog.component';

const booking: Booking = {
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
};

describe('BookingCompleteDialogComponent', () => {
  let api: { completeBooking: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = { completeBooking: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [BookingCompleteDialogComponent],
      providers: [{ provide: BookingsApi, useValue: api }],
    }).compileComponents();
  });

  function createFixture() {
    const fixture = TestBed.createComponent(BookingCompleteDialogComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('booking', booking);
    fixture.detectChanges();
    return fixture;
  }

  it('calls completeBooking and emits the updated booking after confirmation', () => {
    const completedBooking: Booking = {
      ...booking,
      status: 'completed',
      completed_at: '2020-06-20T11:00:00',
    };
    const updates: Booking[] = [];
    api.completeBooking.mockReturnValue(of<BookingResponse>({ booking: completedBooking }));

    const fixture = createFixture();
    fixture.componentInstance.bookingUpdated.subscribe((updatedBooking) => updates.push(updatedBooking));

    fixture.componentInstance.submit();

    expect(api.completeBooking).toHaveBeenCalledWith(booking.id);
    expect(updates).toEqual([completedBooking]);
  });

  it('shows the backend message for a 422 response', () => {
    api.completeBooking.mockReturnValue(
      throwError(() => new ApiClientError('La sesión aún no puede finalizarse.', 422, 'ValidationError')),
    );

    const fixture = createFixture();
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('La sesión aún no puede finalizarse.');
  });

  it('prevents a second submit while the completion request is pending', () => {
    const response = new Subject<BookingResponse>();
    api.completeBooking.mockReturnValue(response);

    const fixture = createFixture();
    fixture.componentInstance.submit();
    fixture.componentInstance.submit();

    expect(api.completeBooking).toHaveBeenCalledTimes(1);
  });
});
