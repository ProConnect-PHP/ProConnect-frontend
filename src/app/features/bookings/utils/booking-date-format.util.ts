import { extractTime } from '../../../shared/utils/date.util';

export function formatBookingDate(value: string): string {
  const date = parseApiDate(value);

  if (!date) return value;

  return new Intl.DateTimeFormat('es-UY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatBookingDateTime(value: string): string {
  const date = parseApiDate(value);

  if (!date) return value;

  return new Intl.DateTimeFormat('es-UY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatBookingTimeRange(startsAt: string, endsAt: string): string {
  return `${extractTime(startsAt)} - ${extractTime(endsAt)}`;
}

export function toBookingDateInputValue(value: string): string {
  return value.slice(0, 10);
}

export function isPastBooking(endsAt: string): boolean {
  const date = parseApiDate(endsAt);
  if (!date) return false;
  return date.getTime() < Date.now();
}

function parseApiDate(value: string): Date | null {
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}
