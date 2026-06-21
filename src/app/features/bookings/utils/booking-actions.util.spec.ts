import { Booking } from '../models/booking.models';
import { canCompleteBooking } from './booking-actions.util';

const pastStart = '2020-06-20T10:00:00';

function createBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-1',
    service_id: 'service-1',
    professional_id: 'professional-1',
    client_id: 'client-1',
    starts_at: pastStart,
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

describe('canCompleteBooking', () => {
  it.each(['confirmed', 'paid', 'in_progress'] as const)(
    'returns true for a past %s booking',
    (status) => {
      expect(canCompleteBooking(createBooking({ status }))).toBe(true);
    },
  );

  it.each(['pending', 'cancelled', 'completed', 'no_show'] as const)(
    'returns false for a %s booking',
    (status) => {
      expect(canCompleteBooking(createBooking({ status }))).toBe(false);
    },
  );

  it('returns false for a future booking', () => {
    expect(canCompleteBooking(createBooking({ starts_at: '2099-06-20T10:00:00' }))).toBe(false);
  });
});
