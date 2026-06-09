import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { VideoSessionDeviceSettingsComponent } from '../video-session-device-settings/video-session-device-settings.component';

@Component({
  selector: 'app-video-session-waiting-state',
  imports: [VideoSessionDeviceSettingsComponent],
  templateUrl: './video-session-waiting-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoSessionWaitingStateComponent {
  readonly loading = input(false);
  readonly error = input<string | null>(null);

  readonly join = output<void>();
  readonly cameraChange = output<string | null>();
  readonly microphoneChange = output<string | null>();
  readonly retryPermissions = output<void>();
}
