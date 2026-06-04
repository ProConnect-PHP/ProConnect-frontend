import { mapPackageError } from './packages-error.mapper';

describe('packages error mapper', () => {
  it('maps ClientPackageExpired', () => {
    expect(mapPackageError('ClientPackageExpired')).toBe('Este paquete vencio.');
  });

  it('uses fallback for unknown errors', () => {
    expect(mapPackageError('UnknownPackageError', 'Mensaje backend')).toBe('Mensaje backend');
  });
});
