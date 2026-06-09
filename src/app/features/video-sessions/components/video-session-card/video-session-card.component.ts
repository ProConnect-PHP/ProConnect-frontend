import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import {
  VideoProvider,
  VideoSession,
  VideoSessionStatus,
} from '../../data-access/video-sessions.models';
import { VideoSessionStatusBadgeComponent } from '../video-session-status-badge/video-session-status-badge.component';

type VideoSessionCardVariant = 'client' | 'professional';

@Component({
  selector: 'app-video-session-card',
  imports: [VideoSessionStatusBadgeComponent],
  templateUrl: './video-session-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoSessionCardComponent {
  readonly videoSession = input.required<VideoSession>();
  readonly variant = input<VideoSessionCardVariant>('client');
  readonly showActions = input(true);

  readonly joinClicked = output<VideoSession>();
  readonly detailClicked = output<VideoSession>();

  serviceName(videoSession: VideoSession): string {
    return videoSession.booking?.service?.name ?? `Reserva ${videoSession.booking_id}`;
  }

  schedule(videoSession: VideoSession): string {
    const start = videoSession.scheduled_start_at ?? videoSession.booking?.starts_at;
    const end = videoSession.scheduled_end_at ?? videoSession.booking?.ends_at;

    if (!start && !end) return 'Horario no disponible';
    if (!start) return this.formatDateTime(end);
    if (!end) return this.formatDateTime(start);

    return `${this.formatDateTime(start)} - ${this.formatTime(end)}`;
  }

  providerLabel(provider: VideoProvider): string {
    switch (provider) {
      case 'simulator':
        return 'Simulador';
      case 'livekit':
        return 'LiveKit';
      case 'external_url':
        return 'URL externa';
    }
  }

  canJoin(videoSession: VideoSession): boolean {
    return videoSession.can_join_now && !this.isTerminal(videoSession.status);
  }

  detailLabel(): string {
    return this.variant() === 'professional' ? 'Ver reserva' : 'Ver reserva';
  }

  join(videoSession: VideoSession): void {
    if (!this.canJoin(videoSession)) return;
    this.joinClicked.emit(videoSession);
  }

  showDetail(videoSession: VideoSession): void {
    this.detailClicked.emit(videoSession);
  }

  private isTerminal(status: VideoSessionStatus | string): boolean {
    return status === 'ended' || status === 'cancelled' || status === 'expired';
  }

  private formatDateTime(value: string | null | undefined): string {
    if (!value) return 'No disponible';

    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('es-UY', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private formatTime(value: string | null | undefined): string {
    if (!value) return '';

    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      const timeMatch = value.match(/(\d{2}:\d{2})/);
      return timeMatch?.[1] ?? value;
    }

    return new Intl.DateTimeFormat('es-UY', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
