export function formatPrice(value: string | number): string {
  const amount = typeof value === 'string' ? Number(value) : value;

  if (Number.isNaN(amount)) {
    return '$ -';
  }

  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    maximumFractionDigits: 0,
  }).format(amount);
}
