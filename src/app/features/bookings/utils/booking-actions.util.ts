import { Booking } from '../models/booking.models';

const completableStatuses = new Set<Booking['status']>(['confirmed', 'paid', 'in_progress']);

export function canCompleteBooking(booking: Booking): boolean {
  if (!completableStatuses.has(booking.status)) return false;

  const startsAt = parseBookingDate(booking.starts_at);
  return startsAt !== null && startsAt <= Date.now();
}

function parseBookingDate(value: string): number | null {
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const timestamp = new Date(normalized).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}
