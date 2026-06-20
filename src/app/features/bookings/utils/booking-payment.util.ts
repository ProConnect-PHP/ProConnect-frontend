/**
 * A terminal booking must never expose UI that starts or resumes a payment.
 * The backend remains authoritative for payment eligibility and action flags.
 */
export function isBookingPayable(status: string | null | undefined): boolean {
  return !['cancelled', 'finished', 'completed', 'no_show'].includes(
    String(status ?? '').toLowerCase(),
  );
}
