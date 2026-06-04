import { mapPaymentError } from './payments-error.mapper';

describe('payments error mapper', () => {
  it('maps BookingNotPayable', () => {
    expect(mapPaymentError('BookingNotPayable')).toBe('Solo podes pagar reservas confirmadas.');
  });

  it('uses a fallback for unknown errors', () => {
    expect(mapPaymentError('UnknownPaymentError', 'Mensaje backend')).toBe('Mensaje backend');
  });
});
