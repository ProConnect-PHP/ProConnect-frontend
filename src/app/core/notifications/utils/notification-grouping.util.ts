import {
  AppNotification,
  NotificationDayGroup,
} from '../models/notification.models';

const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

export function groupNotificationsByDay(
  notifications: AppNotification[],
  now = new Date(),
): NotificationDayGroup[] {
  const groups = new Map<string, AppNotification[]>();
  const sorted = [...notifications].sort(
    (left, right) => notificationTimestamp(right) - notificationTimestamp(left),
  );

  for (const notification of sorted) {
    const dateKey = getNotificationLocalDateKey(notification);
    const items = groups.get(dateKey) ?? [];
    items.push(notification);
    groups.set(dateKey, items);
  }

  return Array.from(groups, ([date, items]) => ({
    date,
    label: buildNotificationDateLabel(date, now),
    items,
  }));
}

export function getLocalDateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function buildNotificationDateLabel(dateKey: string, now = new Date()): string {
  const today = getLocalDateKey(now);
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getLocalDateKey(yesterdayDate);

  if (dateKey === today) return 'Hoy';
  if (dateKey === yesterday) return 'Ayer';

  const parsed = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateKey;

  const label = new Intl.DateTimeFormat('es-UY', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsed);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function notificationTimeLabel(notification: AppNotification): string {
  const date = new Date(notification.created_at);
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('es-UY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  return notification.created_time || '--:--';
}

export function notificationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'booking.created': 'Reserva',
    'booking.confirmed': 'Reserva',
    'booking.cancelled': 'Reserva',
    'booking.rescheduled': 'Reserva',
    'booking.reminder': 'Recordatorio',
    'package.purchased': 'Paquete',
    'package.booking.used': 'Paquete',
    'payment.received': 'Pago',
    'payment.succeeded': 'Pago',
    'video.session.available': 'Videollamada',
  };

  return labels[type] ?? 'Novedad';
}

function getNotificationLocalDateKey(notification: AppNotification): string {
  const localDate = getLocalDateKey(notification.created_at);
  if (localDate) return localDate;
  if (dateKeyPattern.test(notification.created_date)) return notification.created_date;
  return 'Sin fecha';
}

function notificationTimestamp(notification: AppNotification): number {
  const timestamp = new Date(notification.created_at).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}
