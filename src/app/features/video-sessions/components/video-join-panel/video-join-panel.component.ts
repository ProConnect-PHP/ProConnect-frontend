import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { VideoSessionsApi } from '../../data-access/video-sessions.api';
import { mapVideoSessionApiError } from '../../data-access/video-sessions-error.mapper';
import {
  VideoProvider,
  VideoSession,
  VideoSessionJoin,
} from '../../data-access/video-sessions.models';
import { VideoSessionStatusBadgeComponent } from '../video-session-status-badge/video-session-status-badge.component';

@Component({
  selector: 'app-video-join-panel',
  imports: [VideoSessionStatusBadgeComponent],
  templateUrl: './video-join-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoJoinPanelComponent {
  private readonly api = inject(VideoSessionsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly videoSession = input.required<VideoSession>();
  readonly joined = output<VideoSessionJoin>();

  readonly joining = signal(false);
  readonly errorMessage = signal<string | null>(null);

  enterRoom(): void {
    const videoSession = this.videoSession();
    if (this.joining() || !videoSession.can_join_now) {
      if (!videoSession.can_join_now) {
        this.errorMessage.set('Esta sala todavia no esta disponible.');
      }
      return;
    }

    this.errorMessage.set(null);
    this.joining.set(true);

    this.api
      .joinVideoSession(videoSession.id)
      .pipe(
        finalize(() => this.joining.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (join) => this.joined.emit(join),
        error: (error: unknown) =>
          this.errorMessage.set(mapVideoSessionApiError(error, 'No pudimos entrar a la sala.')),
      });
  }

  providerLabel(provider: VideoProvider): string {
    if (provider === 'simulator') return 'Simulador';
    if (provider === 'livekit') return 'LiveKit';
    return 'URL externa';
  }

  schedule(videoSession: VideoSession): string {
    const start = videoSession.scheduled_start_at ?? videoSession.booking?.starts_at;
    if (!start) return 'Horario no disponible';

    const normalized = start.includes('T') ? start : start.replace(' ', 'T');
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return start;

    return new Intl.DateTimeFormat('es-UY', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
