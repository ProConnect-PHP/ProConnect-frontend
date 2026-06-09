import {
  formatMinutesBefore,
  minutesToTimeValue,
  timeValueToMinutes,
} from './time-options.util';

describe('booking policy time utilities', () => {
  it('converts 120 minutes to 2 hours', () => {
    expect(minutesToTimeValue(120)).toEqual({ value: 2, unit: 'hours' });
  });

  it('converts 1440 minutes to 1 day', () => {
    expect(minutesToTimeValue(1440)).toEqual({ value: 1, unit: 'days' });
  });

  it('converts 2 hours to 120 minutes', () => {
    expect(timeValueToMinutes(2, 'hours')).toBe(120);
  });

  it('formats human-readable times', () => {
    expect(formatMinutesBefore(120)).toBe('2 horas antes');
    expect(formatMinutesBefore(1440)).toBe('1 dia antes');
  });
});
