export function formatMoney(value: string | number, currency = 'UYU'): string {
  const numericValue = typeof value === 'number' ? value : Number(value);

  if (Number.isNaN(numericValue)) return String(value);

  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export function formatMoneyDecimal(value: string | number, currency = 'UYU'): string {
  const numericValue = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(numericValue)) return String(value);

  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(numericValue)
    .replace(/\u00a0/g, ' ');
}
