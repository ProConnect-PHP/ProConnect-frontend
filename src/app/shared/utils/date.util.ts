export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatTimeRange(startsAt: string, endsAt: string): string {
  return `${extractTime(startsAt)} - ${extractTime(endsAt)}`;
}

export function extractTime(value: string): string {
  const timeMatch = value.match(/(\d{2}:\d{2})/);
  return timeMatch?.[1] ?? value;
}
