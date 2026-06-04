import { formatMoney } from '../../../shared/utils/money.util';

export function formatPackageValidity(validityDays: number | null): string {
  if (!validityDays) return 'Sin vencimiento definido';
  if (validityDays === 1) return 'Valido por 1 dia';
  return `Valido por ${validityDays} dias`;
}

export function formatPackagePricePerSession(
  price: number,
  sessionsCount: number,
  currency = 'UYU',
): string {
  const divisor = sessionsCount > 0 ? sessionsCount : 1;
  return `${formatMoney(price / divisor, currency)} por sesion`;
}
