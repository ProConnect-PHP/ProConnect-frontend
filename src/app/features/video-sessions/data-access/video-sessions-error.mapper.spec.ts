import { mapVideoSessionError } from './video-sessions-error.mapper';

describe('video sessions error mapper', () => {
  it('maps closed join window errors', () => {
    expect(mapVideoSessionError('VideoSessionJoinWindowClosed')).toBe(
      'Todavia no podes unirte a esta sesion o la ventana ya finalizo.',
    );
  });

  it('maps forbidden errors', () => {
    expect(mapVideoSessionError('Forbidden')).toBe('No tenes permisos para acceder a esta sesion.');
  });
});
