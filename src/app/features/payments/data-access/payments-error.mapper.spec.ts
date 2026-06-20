import { mapPaymentError } from './payments-error.mapper';

describe('payments error mapper', () => {
  it('maps BookingNotPayable', () => {
    expect(mapPaymentError('BookingNotPayable')).toBe(
      'Esta reserva ya no puede pagarse en su estado actual.',
    );
  });

  it('uses a fallback for unknown errors', () => {
    expect(mapPaymentError('UnknownPaymentError', 'Mensaje backend')).toBe('Mensaje backend');
  });

  it.each([
    [
      'ProviderPaymentNotFound',
      'No encontramos un pago asociado a este intento. Si no completaste el checkout, podés intentar nuevamente.',
    ],
    ['ProviderPaymentAmountMismatch', 'El monto confirmado por el proveedor no coincide.'],
    ['ProviderCurrencyMismatch', 'La moneda confirmada por el proveedor no coincide.'],
    ['PaymentIntentNotSyncable', 'Este intento de pago ya no puede sincronizarse.'],
    [
      'ProviderPaymentRejected',
      'El proveedor rechazó este pago. Podés intentar nuevamente con otro medio de pago.',
    ],
  ])('maps %s to a controlled payment message', (code, message) => {
    expect(mapPaymentError(code)).toBe(message);
  });
});
