import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthStore } from '../../../../core/auth/services/auth.store';
import { hasProfessionalAccess } from '../../../../core/auth/utils/auth-capabilities';
import { VideoSessionControlBarComponent } from '../../components/video-session-control-bar/video-session-control-bar.component';
import { VideoSessionDeviceSettingsComponent } from '../../components/video-session-device-settings/video-session-device-settings.component';
import { VideoSessionParticipantTileComponent } from '../../components/video-session-participant-tile/video-session-participant-tile.component';
import { VideoSessionWaitingStateComponent } from '../../components/video-session-waiting-state/video-session-waiting-state.component';
import { mapVideoSessionApiError } from '../../data-access/video-sessions-error.mapper';
import { LiveKitRoomService } from '../../services/livekit-room.service';
import { MediaDeviceService } from '../../services/media-device.service';
import { VideoSessionApiService } from '../../services/video-session-api.service';

@Component({
  selector: 'app-video-session-room-page',
  host: {
    '(document:keydown.escape)': 'closeSettings()',
  },
  imports: [
    VideoSessionControlBarComponent,
    VideoSessionDeviceSettingsComponent,
    VideoSessionParticipantTileComponent,
    VideoSessionWaitingStateComponent,
  ],
  templateUrl: './video-session-room-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoSessionRoomPageComponent
  implements OnInit, AfterViewChecked, OnDestroy
{
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(VideoSessionApiService);
  private readonly authStore = inject(AuthStore);

  readonly liveKit = inject(LiveKitRoomService);
  readonly mediaDevices = inject(MediaDeviceService);

  @ViewChild('localVideo')
  private readonly localVideo?: ElementRef<HTMLVideoElement>;

  @ViewChild(VideoSessionControlBarComponent)
  private readonly controlBar?: VideoSessionControlBarComponent;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly participantName = signal<string | null>(null);
  readonly settingsOpen = signal(false);

  readonly state = this.liveKit.connectionState;
  readonly connected = computed(() => this.state().connected);
  readonly connecting = computed(() => this.state().connecting || this.loading());
  readonly controlsDisabled = computed(
    () => this.connecting() || this.state().controlsBusy,
  );
  readonly displayedError = computed(() => this.error() ?? this.state().error);
  readonly remoteParticipants = this.liveKit.remoteParticipants;
  readonly localVideoRevision = this.liveKit.localVideoRevision;

  private readonly bookingId = this.route.snapshot.paramMap.get('bookingId');
  private localVideoAttached = false;
  private readonly handleDeviceChange = async (): Promise<void> => {
    const previousCameraId = this.mediaDevices.selectedCameraId();
    const previousMicrophoneId = this.mediaDevices.selectedMicrophoneId();

    await this.mediaDevices.enumerateDevices();

    if (
      this.connected() &&
      previousCameraId &&
      !this.mediaDevices.selectedCameraId()
    ) {
      await this.trySwitchCamera(null);
    }

    if (
      this.connected() &&
      previousMicrophoneId &&
      !this.mediaDevices.selectedMicrophoneId()
    ) {
      await this.trySwitchMicrophone(null);
    }
  };

  constructor() {
    effect(() => {
      const connected = this.connected();
      this.localVideoRevision();

      if (!connected) {
        this.localVideoAttached = false;
        return;
      }

      this.scheduleLocalVideoAttach();
    });
  }

  async ngOnInit(): Promise<void> {
    if (!this.bookingId) {
      this.error.set('No se encontro la reserva asociada a esta videollamada.');
    }

    await this.mediaDevices.initialize();
    if (typeof navigator !== 'undefined') {
      navigator.mediaDevices?.addEventListener?.(
        'devicechange',
        this.handleDeviceChange,
      );
    }
  }

  async join(): Promise<void> {
    if (!this.bookingId || this.connecting() || this.connected()) return;

    this.loading.set(true);
    this.error.set(null);
    this.localVideoAttached = false;

    try {
      const permissionResult =
        await this.mediaDevices.requestAudioVideoPermissions();
      this.error.set(permissionResult.error);

      const response = await firstValueFrom(
        this.api.joinBookingVideoSession(this.bookingId),
      );
      this.participantName.set(response.data.participantName);
      await this.liveKit.connect(response.data.url, response.data.token);
      this.error.set(this.state().error);
      this.scheduleLocalVideoAttach();
    } catch (error: unknown) {
      this.error.set(
        this.state().error ??
          mapVideoSessionApiError(
            error,
            'No se pudo ingresar a la videollamada. Verifica tus permisos o intenta nuevamente.',
          ),
      );
    } finally {
      this.loading.set(false);
    }
  }

  async toggleCamera(): Promise<void> {
    try {
      await this.liveKit.toggleCamera();
      this.scheduleLocalVideoAttach();
    } catch {
      this.error.set(this.state().error);
    }
  }

  async toggleMicrophone(): Promise<void> {
    try {
      await this.liveKit.toggleMicrophone();
    } catch {
      this.error.set(this.state().error);
    }
  }

  toggleSettings(): void {
    if (this.settingsOpen()) {
      this.closeSettings();
    } else {
      this.settingsOpen.set(true);
    }
  }

  closeSettings(): void {
    if (!this.settingsOpen()) return;

    this.settingsOpen.set(false);
    queueMicrotask(() => this.controlBar?.focusSettingsButton());
  }

  async switchCamera(deviceId: string | null): Promise<void> {
    await this.trySwitchCamera(deviceId);
  }

  async switchMicrophone(deviceId: string | null): Promise<void> {
    await this.trySwitchMicrophone(deviceId);
  }

  async retryPermissions(): Promise<void> {
    this.error.set(null);
    await this.liveKit.retryPermissions();
    this.scheduleLocalVideoAttach();
  }

  async leave(): Promise<void> {
    this.settingsOpen.set(false);
    await this.liveKit.disconnect();

    if (!this.bookingId) {
      await this.router.navigate(['/video-sessions/my']);
      return;
    }

    const bookingRoute = hasProfessionalAccess(this.authStore.currentUser())
      ? '/professional/bookings'
      : '/my-bookings';
    await this.router.navigate([bookingRoute, this.bookingId]);
  }

  ngAfterViewChecked(): void {
    this.tryAttachLocalVideo();
  }

  private tryAttachLocalVideo(): void {
    if (
      !this.connected() ||
      !this.state().cameraEnabled ||
      this.localVideoAttached
    ) {
      return;
    }

    const element = this.localVideo?.nativeElement;
    if (!element) return;

    const attached = this.liveKit.attachLocalVideo(element);
    if (attached) {
      this.localVideoAttached = true;
    }
  }

  ngOnDestroy(): void {
    if (typeof navigator !== 'undefined') {
      navigator.mediaDevices?.removeEventListener?.(
        'devicechange',
        this.handleDeviceChange,
      );
    }
    void this.liveKit.disconnect();
  }

  localParticipantName(): string {
    return (
      this.state().localParticipantName ??
      this.participantName() ??
      'Vos'
    );
  }

  localInitial(): string {
    return this.localParticipantName().slice(0, 1).toUpperCase() || 'V';
  }

  private async trySwitchCamera(deviceId: string | null): Promise<void> {
    this.error.set(null);

    try {
      await this.liveKit.switchCamera(deviceId);
      this.scheduleLocalVideoAttach();
    } catch {
      this.error.set(this.state().error);
    }
  }

  private async trySwitchMicrophone(deviceId: string | null): Promise<void> {
    this.error.set(null);

    try {
      await this.liveKit.switchMicrophone(deviceId);
    } catch {
      this.error.set(this.state().error);
    }
  }

  private scheduleLocalVideoAttach(): void {
    this.localVideoAttached = false;
    queueMicrotask(() => this.tryAttachLocalVideo());
  }
}
