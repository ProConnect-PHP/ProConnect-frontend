export type AgendaDay = {
  date: Date;
  key: string;
  label: string;
  shortLabel: string;
  dayNumber: string;
  isToday: boolean;
};

export function startOfWeek(date: Date): Date {
  const target = new Date(date);
  const day = target.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  target.setDate(target.getDate() + diff);
  target.setHours(0, 0, 0, 0);

  return target;
}

export function addDays(date: Date, days: number): Date {
  const target = new Date(date);
  target.setDate(target.getDate() + days);
  return target;
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function dateKeyFromIso(value: string): string {
  return toDateInputValue(new Date(value));
}

export function buildWeekDays(referenceDate: Date): AgendaDay[] {
  const start = startOfWeek(referenceDate);
  const todayKey = toDateInputValue(new Date());

  return Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(start, index);
    const key = toDateInputValue(date);

    return {
      date,
      key,
      label: new Intl.DateTimeFormat('es-UY', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      }).format(date),
      shortLabel: new Intl.DateTimeFormat('es-UY', {
        weekday: 'short',
      }).format(date),
      dayNumber: new Intl.DateTimeFormat('es-UY', {
        day: '2-digit',
      }).format(date),
      isToday: key === todayKey,
    };
  });
}

export function formatAgendaRangeTitle(referenceDate: Date): string {
  const start = startOfWeek(referenceDate);
  const end = addDays(start, 6);

  const startLabel = new Intl.DateTimeFormat('es-UY', {
    day: 'numeric',
    month: 'short',
  }).format(start);

  const endLabel = new Intl.DateTimeFormat('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(end);

  return `${startLabel} - ${endLabel}`;
}

export function formatEventTimeRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);

  const formatter = new Intl.DateTimeFormat('es-UY', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}
