import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

import {
  MediaDeviceKindOption,
  MediaDeviceOption,
} from '../models/media-device-option.model';

export interface MediaPermissionRequestResult {
  granted: boolean;
  error: string | null;
}

const SELECTED_CAMERA_STORAGE_KEY = 'proconnect.video.selectedCameraId';
const SELECTED_MICROPHONE_STORAGE_KEY =
  'proconnect.video.selectedMicrophoneId';

@Injectable({ providedIn: 'root' })
export class MediaDeviceService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly cameras = signal<MediaDeviceOption[]>([]);
  readonly microphones = signal<MediaDeviceOption[]>([]);
  readonly selectedCameraId = signal<string | null>(null);
  readonly selectedMicrophoneId = signal<string | null>(null);
  readonly permissionsGranted = signal(false);
  readonly permissionError = signal<string | null>(null);
  readonly loadingDevices = signal(false);

  private preferencesLoaded = false;

  async initialize(): Promise<void> {
    if (!this.isBrowser()) return;

    this.loadPreferences();
    await this.enumerateDevices();
  }

  async requestAudioVideoPermissions(): Promise<MediaPermissionRequestResult> {
    if (!this.hasMediaDevices()) {
      return this.unsupportedResult();
    }

    this.permissionError.set(null);
    this.loadingDevices.set(true);

    try {
      const cameraResult = await this.requestMediaPermission(
        'videoinput',
        this.selectedCameraId(),
      );
      const microphoneResult = await this.requestMediaPermission(
        'audioinput',
        this.selectedMicrophoneId(),
      );
      const errors = [cameraResult.error, microphoneResult.error].filter(
        (message): message is string => !!message,
      );

      this.permissionsGranted.set(
        cameraResult.granted || microphoneResult.granted,
      );
      this.permissionError.set(errors.length ? errors.join(' ') : null);
      await this.enumerateDevices();

      return {
        granted: cameraResult.granted || microphoneResult.granted,
        error: this.permissionError(),
      };
    } finally {
      this.loadingDevices.set(false);
    }
  }

  async requestCameraPermission(
    deviceId?: string | null,
  ): Promise<MediaPermissionRequestResult> {
    const result = await this.requestMediaPermission('videoinput', deviceId);
    this.permissionsGranted.set(result.granted);
    this.permissionError.set(result.error);
    await this.enumerateDevices();
    return result;
  }

  async requestMicrophonePermission(
    deviceId?: string | null,
  ): Promise<MediaPermissionRequestResult> {
    const result = await this.requestMediaPermission('audioinput', deviceId);
    this.permissionsGranted.set(result.granted);
    this.permissionError.set(result.error);
    await this.enumerateDevices();
    return result;
  }

  async enumerateDevices(): Promise<void> {
    if (!this.hasMediaDevices()) {
      this.permissionError.set(
        'Este navegador no soporta seleccion de camara y microfono.',
      );
      return;
    }

    this.loadingDevices.set(true);

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.cameras.set(
        this.mapDevices(devices, 'videoinput', 'Camara'),
      );
      this.microphones.set(
        this.mapDevices(devices, 'audioinput', 'Microfono'),
      );
      this.ensureSelectedDeviceStillExists();
    } catch (error: unknown) {
      this.permissionError.set(this.normalizeMediaError(error));
    } finally {
      this.loadingDevices.set(false);
    }
  }

  selectCamera(deviceId: string | null): void {
    this.selectedCameraId.set(deviceId);
    this.persistPreference(SELECTED_CAMERA_STORAGE_KEY, deviceId);
  }

  selectMicrophone(deviceId: string | null): void {
    this.selectedMicrophoneId.set(deviceId);
    this.persistPreference(SELECTED_MICROPHONE_STORAGE_KEY, deviceId);
  }

  clearPermissionError(): void {
    this.permissionError.set(null);
  }

  setPermissionError(message: string | null): void {
    this.permissionError.set(message);
  }

  normalizeMediaError(error: unknown): string {
    const name = readErrorProperty(error, 'name');
    const detail = readErrorProperty(error, 'message');

    switch (name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'El navegador bloqueo el acceso a camara o microfono. Hace click en el candado de la barra de direcciones, permiti los dispositivos y volve a intentar.';
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'No se encontro una camara o microfono disponible. Verifica que el dispositivo este conectado correctamente.';
      case 'NotReadableError':
      case 'TrackStartError':
        return 'No se pudo iniciar el dispositivo. Puede estar siendo usado por otra aplicacion como Zoom, Teams u otro navegador.';
      case 'OverconstrainedError':
      case 'ConstraintNotSatisfiedError':
        return 'El dispositivo seleccionado ya no esta disponible o no cumple la configuracion solicitada. Elegi otro dispositivo.';
      case 'SecurityError':
        return 'El navegador bloqueo el acceso por seguridad. Verifica que estes usando HTTPS o localhost.';
      case 'AbortError':
        return 'El navegador cancelo el acceso al dispositivo. Intenta nuevamente.';
      default:
        return detail
          ? `No se pudo acceder a los dispositivos multimedia: ${detail}`
          : 'No se pudo acceder a los dispositivos multimedia.';
    }
  }

  private async requestMediaPermission(
    kind: MediaDeviceKindOption,
    deviceId?: string | null,
  ): Promise<MediaPermissionRequestResult> {
    if (!this.hasMediaDevices()) {
      return this.unsupportedResult();
    }

    try {
      const constraint = deviceId
        ? { deviceId: { exact: deviceId } }
        : true;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: kind === 'audioinput' ? constraint : false,
        video: kind === 'videoinput' ? constraint : false,
      });

      stopMediaStream(stream);
      return { granted: true, error: null };
    } catch (error: unknown) {
      const message = this.normalizeMediaError(error);
      return {
        granted: false,
        error: `${kind === 'videoinput' ? 'Camara' : 'Microfono'}: ${message}`,
      };
    }
  }

  private mapDevices(
    devices: MediaDeviceInfo[],
    kind: MediaDeviceKindOption,
    fallbackPrefix: string,
  ): MediaDeviceOption[] {
    return devices
      .filter((device) => device.kind === kind)
      .map((device, index) =>
        this.toMediaDeviceOption(device, `${fallbackPrefix} ${index + 1}`),
      );
  }

  private toMediaDeviceOption(
    device: MediaDeviceInfo,
    fallbackLabel: string,
  ): MediaDeviceOption {
    return {
      deviceId: device.deviceId,
      groupId: device.groupId,
      kind: device.kind as MediaDeviceKindOption,
      label: device.label || fallbackLabel,
      isDefault: device.deviceId === 'default',
    };
  }

  private ensureSelectedDeviceStillExists(): void {
    const selectedCameraId = this.selectedCameraId();
    const selectedMicrophoneId = this.selectedMicrophoneId();

    if (
      selectedCameraId &&
      !this.cameras().some((device) => device.deviceId === selectedCameraId)
    ) {
      this.selectCamera(null);
    }

    if (
      selectedMicrophoneId &&
      !this.microphones().some(
        (device) => device.deviceId === selectedMicrophoneId,
      )
    ) {
      this.selectMicrophone(null);
    }
  }

  private loadPreferences(): void {
    if (this.preferencesLoaded) return;

    const storage = this.storage();
    this.selectedCameraId.set(
      storage?.getItem(SELECTED_CAMERA_STORAGE_KEY) ?? null,
    );
    this.selectedMicrophoneId.set(
      storage?.getItem(SELECTED_MICROPHONE_STORAGE_KEY) ?? null,
    );
    this.preferencesLoaded = true;
  }

  private persistPreference(key: string, value: string | null): void {
    const storage = this.storage();
    if (!storage) return;

    if (value) {
      storage.setItem(key, value);
    } else {
      storage.removeItem(key);
    }
  }

  private unsupportedResult(): MediaPermissionRequestResult {
    const error =
      'Este navegador no soporta seleccion de camara y microfono.';
    this.permissionsGranted.set(false);
    this.permissionError.set(error);
    return { granted: false, error };
  }

  private hasMediaDevices(): boolean {
    return (
      this.isBrowser() &&
      !!navigator.mediaDevices?.getUserMedia &&
      !!navigator.mediaDevices.enumerateDevices
    );
  }

  private storage(): Storage | null {
    if (!this.isBrowser()) return null;

    try {
      return localStorage;
    } catch {
      return null;
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

function stopMediaStream(stream: MediaStream): void {
  for (const track of stream.getTracks()) track.stop();
}

function readErrorProperty(
  error: unknown,
  property: 'name' | 'message',
): string {
  if (!error || typeof error !== 'object' || !(property in error)) return '';
  return String((error as Record<'name' | 'message', unknown>)[property]);
}
