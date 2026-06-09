import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MediaDeviceService } from './media-device.service';

const cameraDevice = {
  deviceId: 'camera-1',
  groupId: 'video-group',
  kind: 'videoinput',
  label: '',
  toJSON: () => ({}),
} satisfies MediaDeviceInfo;

const microphoneDevice = {
  deviceId: 'microphone-1',
  groupId: 'audio-group',
  kind: 'audioinput',
  label: 'Microphone Array',
  toJSON: () => ({}),
} satisfies MediaDeviceInfo;

describe('MediaDeviceService', () => {
  const originalMediaDevicesDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'mediaDevices',
  );

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();

    if (originalMediaDevicesDescriptor) {
      Object.defineProperty(
        navigator,
        'mediaDevices',
        originalMediaDevicesDescriptor,
      );
    } else {
      Reflect.deleteProperty(navigator, 'mediaDevices');
    }
  });

  it('enumerates devices with fallback labels and restores preferences', async () => {
    localStorage.setItem(
      'proconnect.video.selectedCameraId',
      cameraDevice.deviceId,
    );
    setMediaDevices({
      enumerateDevices: vi.fn(async () => [cameraDevice, microphoneDevice]),
      getUserMedia: vi.fn(),
    });

    const service = createService();
    await service.initialize();

    expect(service.cameras()).toEqual([
      {
        deviceId: 'camera-1',
        groupId: 'video-group',
        kind: 'videoinput',
        label: 'Camara 1',
        isDefault: false,
      },
    ]);
    expect(service.microphones()[0]?.label).toBe('Microphone Array');
    expect(service.selectedCameraId()).toBe('camera-1');
  });

  it('keeps partial permission success and stops temporary tracks', async () => {
    const stop = vi.fn();
    setMediaDevices({
      enumerateDevices: vi.fn(async () => [cameraDevice, microphoneDevice]),
      getUserMedia: vi.fn(async (constraints: MediaStreamConstraints) => {
        if (constraints.video) {
          return {
            getTracks: () => [{ stop }],
          } as unknown as MediaStream;
        }

        throw {
          name: 'NotAllowedError',
          message: 'permission denied',
        };
      }),
    });

    const service = createService();
    const result = await service.requestAudioVideoPermissions();

    expect(result.granted).toBe(true);
    expect(result.error).toContain('Microfono:');
    expect(service.permissionsGranted()).toBe(true);
    expect(stop).toHaveBeenCalledOnce();
  });

  it('clears a stored preference when the device disappears', async () => {
    localStorage.setItem(
      'proconnect.video.selectedCameraId',
      cameraDevice.deviceId,
    );
    setMediaDevices({
      enumerateDevices: vi.fn(async () => [microphoneDevice]),
      getUserMedia: vi.fn(),
    });

    const service = createService();
    await service.initialize();

    expect(service.selectedCameraId()).toBeNull();
    expect(
      localStorage.getItem('proconnect.video.selectedCameraId'),
    ).toBeNull();
  });
});

function createService(): MediaDeviceService {
  TestBed.configureTestingModule({
    providers: [
      MediaDeviceService,
      {
        provide: PLATFORM_ID,
        useValue: 'browser',
      },
    ],
  });
  return TestBed.inject(MediaDeviceService);
}

function setMediaDevices(
  mediaDevices: Pick<
    MediaDevices,
    'enumerateDevices' | 'getUserMedia'
  >,
): void {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: mediaDevices,
  });
}
