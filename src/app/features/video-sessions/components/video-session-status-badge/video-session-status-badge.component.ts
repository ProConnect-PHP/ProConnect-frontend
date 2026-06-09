import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { VideoSessionStatus } from '../../data-access/video-sessions.models';

@Component({
  selector: 'app-video-session-status-badge',
  templateUrl: './video-session-status-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoSessionStatusBadgeComponent {
  readonly status = input<VideoSessionStatus | string | null>(null);
  readonly canJoinNow = input(false);

  readonly label = computed(() => {
    const status = this.normalizedStatus();
    if (this.canJoinNow() && !this.isTerminal(status)) return 'Disponible para ingresar';

    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'open':
        return 'Disponible';
      case 'in_progress':
        return 'En curso';
      case 'ended':
        return 'Finalizada';
      case 'cancelled':
        return 'Cancelada';
      case 'expired':
        return 'Expirada';
      default:
        return 'Sin estado';
    }
  });

  readonly classes = computed(() => {
    const base = 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold';
    const status = this.normalizedStatus();

    if (this.canJoinNow() && !this.isTerminal(status)) {
      return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
    }

    switch (status) {
      case 'scheduled':
        return `${base} border-blue-200 bg-blue-50 text-blue-700`;
      case 'open':
      case 'in_progress':
        return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
      case 'ended':
        return `${base} border-slate-200 bg-slate-100 text-slate-700`;
      case 'cancelled':
        return `${base} border-rose-200 bg-rose-50 text-rose-700`;
      case 'expired':
        return `${base} border-amber-200 bg-amber-50 text-amber-700`;
      default:
        return `${base} border-slate-200 bg-white text-slate-600`;
    }
  });

  private normalizedStatus(): string {
    return this.status() ?? 'unknown';
  }

  private isTerminal(status: string): boolean {
    return status === 'ended' || status === 'cancelled' || status === 'expired';
  }
}
