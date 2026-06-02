import { BookingStatus } from '../models/booking.models';

export function bookingStatusLabel(status: BookingStatus): string {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'confirmed':
      return 'Confirmada';
    case 'paid':
      return 'Pagada';
    case 'in_progress':
      return 'En curso';
    case 'completed':
      return 'Finalizada';
    case 'cancelled':
      return 'Cancelada';
    case 'no_show':
      return 'No asistida';
  }
}

export function bookingStatusClasses(status: BookingStatus): string {
  const base = 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold';

  switch (status) {
    case 'pending':
      return `${base} border-amber-200 bg-amber-50 text-amber-700`;
    case 'confirmed':
      return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
    case 'paid':
      return `${base} border-indigo-200 bg-indigo-50 text-indigo-700`;
    case 'in_progress':
      return `${base} border-blue-200 bg-blue-50 text-blue-700`;
    case 'completed':
      return `${base} border-slate-200 bg-slate-100 text-slate-700`;
    case 'cancelled':
      return `${base} border-rose-200 bg-rose-50 text-rose-700`;
    case 'no_show':
      return `${base} border-zinc-200 bg-zinc-100 text-zinc-700`;
  }
}
