import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { PublicServiceModality } from '../../models/public-discovery.models';
import { modalityLabel } from '../../utils/modality-label.util';

@Component({
  selector: 'app-public-modality-badge',
  template: `
    <span [class]="classes()">
      {{ label() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicModalityBadgeComponent {
  readonly modality = input.required<PublicServiceModality>();

  readonly label = computed(() => modalityLabel(this.modality()));

  readonly classes = computed(() => {
    const tone: Record<PublicServiceModality, string> = {
      presencial: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      remota: 'border-indigo-200 bg-indigo-50 text-indigo-800',
      hibrida: 'border-amber-200 bg-amber-50 text-amber-900',
    };

    return `inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tone[this.modality()]}`;
  });
}
