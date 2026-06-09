import { TestBed } from '@angular/core/testing';

import { MediaDeviceService } from './media-device.service';
import { LiveKitRoomService, liveKitErrorMessage } from './livekit-room.service';

describe('LiveKitRoomService local preview', () => {
  it('returns false while no local camera track is available', () => {
    const service = createService();

    expect(
      service.attachLocalVideo(document.createElement('video')),
    ).toBe(false);
  });

  it('attaches the local camera track to the existing video element', () => {
    const service = createService();
    const element = document.createElement('video');
    const detach = vi.fn();
    const attach = vi.fn();
    element.play = vi.fn(async () => undefined);

    Object.defineProperty(service, 'room', {
      configurable: true,
      value: {
        localParticipant: {
          videoTrackPublications: new Map([
            [
              'camera-publication',
              {
                source: 'camera',
                videoTrack: { detach, attach },
              },
            ],
          ]),
        },
      },
      writable: true,
    });

    expect(service.attachLocalVideo(element)).toBe(true);
    expect(detach).toHaveBeenCalledWith(element);
    expect(attach).toHaveBeenCalledWith(element);
    expect(element.muted).toBe(true);
    expect(element.autoplay).toBe(true);
    expect(element.playsInline).toBe(true);
  });
});

describe('liveKitErrorMessage', () => {
  it('explains browser media permission failures', () => {
    expect(liveKitErrorMessage({ name: 'NotAllowedError' })).toBe(
      'No se pudo acceder a la camara o al microfono. Revisa los permisos del navegador.',
    );
  });

  it('uses a connection fallback for other failures', () => {
    expect(liveKitErrorMessage(new Error('connection failed'))).toBe(
      'No se pudo conectar a la videollamada.',
    );
  });
});

function createService(): LiveKitRoomService {
  TestBed.configureTestingModule({
    providers: [
      LiveKitRoomService,
      {
        provide: MediaDeviceService,
        useValue: {
          selectedCameraId: vi.fn(() => null),
          selectedMicrophoneId: vi.fn(() => null),
        },
      },
    ],
  });

  return TestBed.inject(LiveKitRoomService);
}
