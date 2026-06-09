import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import { MediaDeviceService } from '../../services/media-device.service';

@Component({
  selector: 'app-video-session-device-settings',
  templateUrl: './video-session-device-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoSessionDeviceSettingsComponent {
  readonly disabled = input(false);
  readonly showPermissionActions = input(true);
  readonly permissionActionLabel = input('Reintentar permisos');

  readonly cameraChange = output<string | null>();
  readonly microphoneChange = output<string | null>();
  readonly retryPermissions = output<void>();

  readonly mediaDevices = inject(MediaDeviceService);
  readonly cameras = this.mediaDevices.cameras;
  readonly microphones = this.mediaDevices.microphones;
  readonly selectedCameraId = this.mediaDevices.selectedCameraId;
  readonly selectedMicrophoneId = this.mediaDevices.selectedMicrophoneId;
  readonly loadingDevices = this.mediaDevices.loadingDevices;
  readonly permissionError = this.mediaDevices.permissionError;

  readonly hasCameras = computed(() => this.cameras().length > 0);
  readonly hasMicrophones = computed(() => this.microphones().length > 0);

  onCameraChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value || null;
    this.mediaDevices.selectCamera(value);
    this.cameraChange.emit(value);
  }

  onMicrophoneChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value || null;
    this.mediaDevices.selectMicrophone(value);
    this.microphoneChange.emit(value);
  }
}
