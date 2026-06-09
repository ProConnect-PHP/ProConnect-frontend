import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { VideoSessionParticipant } from '../../data-access/video-sessions.models';

@Component({
  selector: 'app-video-participant-list',
  templateUrl: './participant-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantListComponent {
  readonly participants = input<VideoSessionParticipant[]>([]);
  readonly currentParticipantId = input<string | null>(null);

  roleLabel(role: string): string {
    if (role === 'professional') return 'Profesional';
    if (role === 'client') return 'Cliente';
    return role || 'Participante';
  }

  displayName(participant: VideoSessionParticipant): string {
    return participant.display_name ?? participant.provider_identity ?? 'Participante';
  }

  lastSeen(participant: VideoSessionParticipant): string {
    const value = participant.last_joined_at ?? participant.first_joined_at;
    if (!value) return 'Sin conexiones';

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

  isCurrent(participant: VideoSessionParticipant): boolean {
    return participant.id === this.currentParticipantId();
  }
}
