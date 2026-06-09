import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import {
  VideoSession,
  VideoSessionJoin,
  VideoSessionParticipant,
} from '../../data-access/video-sessions.models';
import { ParticipantListComponent } from '../participant-list/participant-list.component';

@Component({
  selector: 'app-simulator-room',
  imports: [ParticipantListComponent],
  templateUrl: './simulator-room.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorRoomComponent {
  readonly videoSession = input.required<VideoSession>();
  readonly join = input.required<VideoSessionJoin>();

  readonly leaveClicked = output<void>();

  readonly microphoneEnabled = signal(true);
  readonly cameraEnabled = signal(true);
  readonly screenSharing = signal(false);

  readonly participants = computed(() => {
    const current = this.join().participant;
    const participants = this.videoSession().participants ?? [];
    const hasCurrent = participants.some((participant) => participant.id === current.id);

    return hasCurrent ? participants : [current, ...participants];
  });

  toggleMicrophone(): void {
    this.microphoneEnabled.update((enabled) => !enabled);
  }

  toggleCamera(): void {
    this.cameraEnabled.update((enabled) => !enabled);
  }

  toggleScreenSharing(): void {
    this.screenSharing.update((enabled) => !enabled);
  }

  leave(): void {
    this.leaveClicked.emit();
  }

  participantName(participant: VideoSessionParticipant): string {
    return participant.display_name ?? participant.provider_identity ?? 'Participante';
  }

  roleLabel(role: string): string {
    if (role === 'professional') return 'Profesional';
    if (role === 'client') return 'Cliente';
    return role || 'Participante';
  }

  tokenStatus(join: VideoSessionJoin): string {
    if (!join.access_token) return 'Token simulado no generado';
    if (!join.expires_at) return 'Token temporal generado';
    return `Token temporal vigente hasta ${this.formatDateTime(join.expires_at)}`;
  }

  formatDateTime(value: string | null): string {
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
}
