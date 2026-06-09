import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';

type VideoSessionEmptyContext = 'client' | 'professional';

@Component({
  selector: 'app-video-session-empty-state',
  imports: [AppEmptyStateComponent],
  templateUrl: './video-session-empty-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoSessionEmptyStateComponent {
  readonly context = input<VideoSessionEmptyContext>('client');

  title(): string {
    return this.context() === 'professional'
      ? 'Todavia no tenes sesiones virtuales programadas.'
      : 'Todavia no tenes sesiones virtuales.';
  }

  description(): string {
    return this.context() === 'professional'
      ? 'Las reservas remotas o hibridas confirmadas apareceran aca.'
      : 'Cuando reserves servicios remotos o hibridos, apareceran aca.';
  }
}
