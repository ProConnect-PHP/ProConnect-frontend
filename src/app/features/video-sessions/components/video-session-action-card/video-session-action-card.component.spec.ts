import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { throwError } from 'rxjs';

import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { Booking } from '../../../bookings/models/booking.models';
import { VideoSessionsApi } from '../../data-access/video-sessions.api';
import { VideoSessionActionCardComponent } from './video-session-action-card.component';

const baseBooking: Booking = {
  id: 'booking-1',
  service_id: 'service-1',
  professional_id: 'professional-1',
  client_id: 'client-1',
  starts_at: '2026-06-05 14:00:00',
  ends_at: '2026-06-05 15:00:00',
  status: 'confirmed',
  modality: 'remota',
  price_snapshot: 1800,
  duration_minutes_snapshot: 60,
  confirmed_at: '2026-06-04 12:00:00',
  cancelled_at: null,
  paid_at: null,
  completed_at: null,
  no_show_at: null,
  cancellation_reason: null,
  reschedule_reason: null,
  created_at: '2026-06-04 11:00:00',
};

describe('VideoSessionActionCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoSessionActionCardComponent],
      providers: [
        provideRouter([]),
        {
          provide: VideoSessionsApi,
          useValue: {
            getBookingVideoSession: () =>
              throwError(() => new ApiClientError('No encontrada', 404, 'VideoSessionNotFound')),
          },
        },
      ],
    }).compileComponents();
  });

  it('does not show prepare action for presencial bookings', () => {
    const fixture = TestBed.createComponent(VideoSessionActionCardComponent);
    fixture.componentRef.setInput('booking', { ...baseBooking, modality: 'presencial' });
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Esta reserva es presencial');
    expect(host.textContent).not.toContain('Preparar sala virtual');
  });

  it('shows prepare action for remote bookings without a room', () => {
    const fixture = TestBed.createComponent(VideoSessionActionCardComponent);
    fixture.componentRef.setInput('booking', baseBooking);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Preparar sala virtual');
  });
});
