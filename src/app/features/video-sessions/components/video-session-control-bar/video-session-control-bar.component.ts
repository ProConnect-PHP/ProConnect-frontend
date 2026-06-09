import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-video-session-control-bar',
  templateUrl: './video-session-control-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoSessionControlBarComponent {
  readonly cameraEnabled = input.required<boolean>();
  readonly microphoneEnabled = input.required<boolean>();
  readonly disabled = input(false);
  readonly settingsOpen = input(false);

  @ViewChild('settingsButton')
  private readonly settingsButton?: ElementRef<HTMLButtonElement>;

  readonly toggleCamera = output<void>();
  readonly toggleMicrophone = output<void>();
  readonly openSettings = output<void>();
  readonly leave = output<void>();

  focusSettingsButton(): void {
    this.settingsButton?.nativeElement.focus();
  }
}
