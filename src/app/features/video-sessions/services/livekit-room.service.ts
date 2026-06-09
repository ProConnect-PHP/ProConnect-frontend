import { Injectable, inject, signal } from '@angular/core';
import {
  RemoteParticipant,
  Room,
  RoomEvent,
  Track,
} from 'livekit-client';

import { MediaDeviceService } from './media-device.service';

export interface LiveKitConnectionState {
  connected: boolean;
  connecting: boolean;
  controlsBusy: boolean;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  localParticipantName: string | null;
  error: string | null;
}

const initialState: LiveKitConnectionState = {
  connected: false,
  connecting: false,
  controlsBusy: false,
  cameraEnabled: false,
  microphoneEnabled: false,
  localParticipantName: null,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class LiveKitRoomService {
  private readonly mediaDeviceService = inject(MediaDeviceService);
  private room: Room | null = null;

  readonly connectionState = signal<LiveKitConnectionState>(initialState);
  readonly remoteParticipants = signal<RemoteParticipant[]>([]);
  readonly localVideoRevision = signal(0);

  get currentRoom(): Room | null {
    return this.room;
  }

  async connect(url: string, token: string): Promise<Room> {
    await this.disconnect();

    this.setState({
      connecting: true,
      connected: false,
      error: null,
    });

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    this.room = room;
    this.registerRoomEvents(room);

    try {
      await room.connect(url, token);
      this.setState({
        connecting: false,
        connected: true,
        localParticipantName:
          room.localParticipant.name || room.localParticipant.identity,
        error: null,
      });
    } catch (error: unknown) {
      const message = liveKitErrorMessage(error);
      await this.teardownRoom(room);
      this.connectionState.set({
        ...initialState,
        error: message,
      });
      throw error;
    }

    const mediaErrors: string[] = [];

    try {
      await room.startAudio();
    } catch {
      mediaErrors.push(
        'El navegador no pudo iniciar el audio de la llamada. Interactua con la pagina y volve a intentar.',
      );
    }

    try {
      await this.enableCamera(this.mediaDeviceService.selectedCameraId());
    } catch {
      const message = this.connectionState().error;
      if (message) mediaErrors.push(`Camara: ${message}`);
    }

    try {
      await this.enableMicrophone(
        this.mediaDeviceService.selectedMicrophoneId(),
      );
    } catch {
      const message = this.connectionState().error;
      if (message) mediaErrors.push(`Microfono: ${message}`);
    }

    this.syncRemoteParticipants();
    this.mediaDeviceService.setPermissionError(
      mediaErrors.length ? mediaErrors.join(' ') : null,
    );
    this.setState({
      connecting: false,
      connected: true,
      cameraEnabled: room.localParticipant.isCameraEnabled,
      microphoneEnabled: room.localParticipant.isMicrophoneEnabled,
      error: mediaErrors.length ? mediaErrors.join(' ') : null,
    });

    return room;
  }

  async disconnect(): Promise<void> {
    const room = this.room;
    if (!room) {
      this.remoteParticipants.set([]);
      this.connectionState.set(initialState);
      return;
    }

    await this.teardownRoom(room);
    this.remoteParticipants.set([]);
    this.connectionState.set(initialState);
  }

  async toggleCamera(): Promise<void> {
    const room = this.room;
    if (!room || this.connectionState().controlsBusy) return;

    this.setState({ controlsBusy: true, error: null });
    try {
      if (room.localParticipant.isCameraEnabled) {
        await room.localParticipant.setCameraEnabled(false);
        this.setState({ cameraEnabled: false });
      } else {
        await this.enableCamera(this.mediaDeviceService.selectedCameraId());
      }
    } catch (error: unknown) {
      const message = this.mediaDeviceService.normalizeMediaError(error);
      this.mediaDeviceService.setPermissionError(message);
      this.setState({
        cameraEnabled: room.localParticipant.isCameraEnabled,
        error: message,
      });
      throw error;
    } finally {
      this.setState({ controlsBusy: false });
    }
  }

  async toggleMicrophone(): Promise<void> {
    const room = this.room;
    if (!room || this.connectionState().controlsBusy) return;

    this.setState({ controlsBusy: true, error: null });
    try {
      if (room.localParticipant.isMicrophoneEnabled) {
        await room.localParticipant.setMicrophoneEnabled(false);
        this.setState({ microphoneEnabled: false });
      } else {
        await this.enableMicrophone(
          this.mediaDeviceService.selectedMicrophoneId(),
        );
      }
    } catch (error: unknown) {
      const message = this.mediaDeviceService.normalizeMediaError(error);
      this.mediaDeviceService.setPermissionError(message);
      this.setState({
        microphoneEnabled: room.localParticipant.isMicrophoneEnabled,
        error: message,
      });
      throw error;
    } finally {
      this.setState({ controlsBusy: false });
    }
  }

  async enableCamera(deviceId?: string | null): Promise<void> {
    const room = this.room;
    if (!room) return;

    try {
      await room.localParticipant.setCameraEnabled(
        true,
        deviceId ? { deviceId: { exact: deviceId } } : undefined,
      );
      this.mediaDeviceService.clearPermissionError();
      this.setState({
        cameraEnabled: room.localParticipant.isCameraEnabled,
        error: null,
      });
      this.bumpLocalVideoRevision();
    } catch (error: unknown) {
      const message = this.mediaDeviceService.normalizeMediaError(error);
      this.mediaDeviceService.setPermissionError(message);
      this.setState({
        cameraEnabled: false,
        error: message,
      });
      throw error;
    }
  }

  async enableMicrophone(deviceId?: string | null): Promise<void> {
    const room = this.room;
    if (!room) return;

    try {
      await room.localParticipant.setMicrophoneEnabled(
        true,
        deviceId ? { deviceId: { exact: deviceId } } : undefined,
      );
      this.mediaDeviceService.clearPermissionError();
      this.setState({
        microphoneEnabled: room.localParticipant.isMicrophoneEnabled,
        error: null,
      });
    } catch (error: unknown) {
      const message = this.mediaDeviceService.normalizeMediaError(error);
      this.mediaDeviceService.setPermissionError(message);
      this.setState({
        microphoneEnabled: false,
        error: message,
      });
      throw error;
    }
  }

  async switchCamera(deviceId: string | null): Promise<void> {
    this.mediaDeviceService.selectCamera(deviceId);
    const room = this.room;
    if (!room || this.connectionState().controlsBusy) return;

    this.setState({ controlsBusy: true, error: null });
    try {
      const publication = Array.from(
        room.localParticipant.videoTrackPublications.values(),
      ).find((item) => item.source === Track.Source.Camera);

      if (publication?.track) {
        const switched = await room.switchActiveDevice(
          'videoinput',
          deviceId ?? 'default',
          !!deviceId,
        );
        if (!switched) {
          throw new Error('LiveKit no pudo cambiar la camara activa.');
        }
      } else {
        await this.enableCamera(deviceId);
      }

      this.mediaDeviceService.clearPermissionError();
      this.setState({
        cameraEnabled: room.localParticipant.isCameraEnabled,
        error: null,
      });
      this.bumpLocalVideoRevision();
    } catch (error: unknown) {
      const message = this.mediaDeviceService.normalizeMediaError(error);
      this.mediaDeviceService.setPermissionError(message);
      this.setState({
        cameraEnabled: room.localParticipant.isCameraEnabled,
        error: message,
      });
      throw error;
    } finally {
      this.setState({ controlsBusy: false });
    }
  }

  async switchMicrophone(deviceId: string | null): Promise<void> {
    this.mediaDeviceService.selectMicrophone(deviceId);
    const room = this.room;
    if (!room || this.connectionState().controlsBusy) return;

    this.setState({ controlsBusy: true, error: null });
    try {
      const publication = Array.from(
        room.localParticipant.audioTrackPublications.values(),
      ).find((item) => item.source === Track.Source.Microphone);

      if (publication?.track) {
        const switched = await room.switchActiveDevice(
          'audioinput',
          deviceId ?? 'default',
          !!deviceId,
        );
        if (!switched) {
          throw new Error('LiveKit no pudo cambiar el microfono activo.');
        }
      } else {
        await this.enableMicrophone(deviceId);
      }

      this.mediaDeviceService.clearPermissionError();
      this.setState({
        microphoneEnabled: room.localParticipant.isMicrophoneEnabled,
        error: null,
      });
    } catch (error: unknown) {
      const message = this.mediaDeviceService.normalizeMediaError(error);
      this.mediaDeviceService.setPermissionError(message);
      this.setState({
        microphoneEnabled: room.localParticipant.isMicrophoneEnabled,
        error: message,
      });
      throw error;
    } finally {
      this.setState({ controlsBusy: false });
    }
  }

  async retryPermissions(): Promise<void> {
    const permissionResult =
      await this.mediaDeviceService.requestAudioVideoPermissions();
    const room = this.room;

    if (!room) {
      this.setState({ error: permissionResult.error });
      return;
    }

    const errors: string[] = [];

    try {
      await this.enableCamera(this.mediaDeviceService.selectedCameraId());
    } catch {
      const message = this.connectionState().error;
      if (message) errors.push(`Camara: ${message}`);
    }

    try {
      await this.enableMicrophone(
        this.mediaDeviceService.selectedMicrophoneId(),
      );
    } catch {
      const message = this.connectionState().error;
      if (message) errors.push(`Microfono: ${message}`);
    }

    const mediaStillUnavailable =
      !room.localParticipant.isCameraEnabled ||
      !room.localParticipant.isMicrophoneEnabled;
    const error = errors.length
      ? errors.join(' ')
      : mediaStillUnavailable
        ? permissionResult.error
        : null;
    this.mediaDeviceService.setPermissionError(error);
    this.setState({
      cameraEnabled: room.localParticipant.isCameraEnabled,
      microphoneEnabled: room.localParticipant.isMicrophoneEnabled,
      error,
    });
  }

  attachLocalVideo(element: HTMLVideoElement): boolean {
    const room = this.room;
    if (!room) return false;

    const publication = Array.from(
      room.localParticipant.videoTrackPublications.values(),
    ).find((item) => item.source === Track.Source.Camera);
    const track = publication?.videoTrack;
    if (!track) return false;

    track.detach(element);
    element.muted = true;
    element.autoplay = true;
    element.playsInline = true;
    track.attach(element);
    void element.play().catch(() => undefined);
    return true;
  }

  private registerRoomEvents(room: Room): void {
    const syncParticipants = () => this.syncRemoteParticipants();

    room.on(RoomEvent.ParticipantConnected, syncParticipants);
    room.on(RoomEvent.ParticipantDisconnected, syncParticipants);
    room.on(RoomEvent.TrackPublished, syncParticipants);
    room.on(RoomEvent.TrackUnpublished, syncParticipants);
    room.on(RoomEvent.TrackSubscribed, syncParticipants);
    room.on(RoomEvent.TrackUnsubscribed, syncParticipants);
    room.on(RoomEvent.TrackMuted, syncParticipants);
    room.on(RoomEvent.TrackUnmuted, syncParticipants);
    room.on(RoomEvent.LocalTrackPublished, (publication) => {
      if (publication.source === Track.Source.Camera) {
        this.bumpLocalVideoRevision();
      }
    });
    room.on(RoomEvent.Disconnected, () => {
      if (this.room !== room) return;

      this.room = null;
      this.remoteParticipants.set([]);
      this.connectionState.set({
        ...initialState,
        error: 'La videollamada se desconecto.',
      });
    });
  }

  private syncRemoteParticipants(): void {
    const room = this.room;
    this.remoteParticipants.set(
      room ? Array.from(room.remoteParticipants.values()) : [],
    );
  }

  private async teardownRoom(room: Room): Promise<void> {
    if (this.room === room) this.room = null;

    room.removeAllListeners();
    this.detachRoomTracks(room);
    await room.disconnect(true);
  }

  private detachRoomTracks(room: Room): void {
    for (const publication of room.localParticipant.trackPublications.values()) {
      removeAttachedElements(publication.track?.detach() ?? []);
    }

    for (const participant of room.remoteParticipants.values()) {
      for (const publication of participant.trackPublications.values()) {
        removeAttachedElements(publication.track?.detach() ?? []);
      }
    }
  }

  private setState(partial: Partial<LiveKitConnectionState>): void {
    this.connectionState.update((current) => ({
      ...current,
      ...partial,
    }));
  }

  private bumpLocalVideoRevision(): void {
    this.localVideoRevision.update((value) => value + 1);
  }
}

export function liveKitErrorMessage(error: unknown): string {
  const name =
    error && typeof error === 'object' && 'name' in error
      ? String(error.name)
      : '';

  if (
    name === 'NotAllowedError' ||
    name === 'NotFoundError' ||
    name === 'NotReadableError' ||
    name === 'OverconstrainedError'
  ) {
    return 'No se pudo acceder a la camara o al microfono. Revisa los permisos del navegador.';
  }

  return 'No se pudo conectar a la videollamada.';
}

function removeAttachedElements(elements: HTMLMediaElement[]): void {
  for (const element of elements) element.remove();
}
