export type TimeUnit = 'minutes' | 'hours' | 'days';

export interface TimeValue {
  value: number;
  unit: TimeUnit;
}

export const POLICY_TIME_OPTIONS = [
  { label: '30 minutos', minutes: 30 },
  { label: '1 hora', minutes: 60 },
  { label: '2 horas', minutes: 120 },
  { label: '6 horas', minutes: 360 },
  { label: '24 horas', minutes: 1440 },
  { label: '2 dias', minutes: 2880 },
  { label: '7 dias', minutes: 10080 },
] as const;

export function minutesToTimeValue(minutes: number): TimeValue {
  if (minutes !== 0 && minutes % 1440 === 0) {
    return { value: minutes / 1440, unit: 'days' };
  }

  if (minutes !== 0 && minutes % 60 === 0) {
    return { value: minutes / 60, unit: 'hours' };
  }

  return { value: minutes, unit: 'minutes' };
}

export function timeValueToMinutes(value: number, unit: TimeUnit): number {
  switch (unit) {
    case 'minutes':
      return value;
    case 'hours':
      return value * 60;
    case 'days':
      return value * 1440;
  }
}

export function formatMinutesBefore(minutes: number): string {
  if (minutes === 0) return 'Hasta el inicio';

  if (minutes < 60) {
    return minutes === 1 ? '1 minuto antes' : `${minutes} minutos antes`;
  }

  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return days === 1 ? '1 dia antes' : `${days} dias antes`;
  }

  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1 ? '1 hora antes' : `${hours} horas antes`;
  }

  return `${minutes} minutos antes`;
}
