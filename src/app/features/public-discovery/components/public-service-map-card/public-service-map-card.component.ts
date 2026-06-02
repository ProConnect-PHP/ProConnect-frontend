import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PublicService } from '../../models/public-discovery.models';
import { formatPrice } from '../../utils/price-format.util';
import { PublicModalityBadgeComponent } from '../public-modality-badge/public-modality-badge.component';

@Component({
  selector: 'app-public-service-map-card',
  imports: [RouterLink, PublicModalityBadgeComponent],
  template: `
    @if (service(); as publicService) {
      <article class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div class="flex flex-wrap gap-2">
              <app-public-modality-badge [modality]="publicService.modality" />
              <span class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {{ publicService.duration_minutes }} min
              </span>
            </div>
            <h3 class="mt-3 text-base font-bold text-slate-950">{{ publicService.name }}</h3>
            @if (publicService.address) {
              <p class="mt-1 text-sm leading-6 text-slate-600">{{ publicService.address }}</p>
            }
          </div>
          <p class="text-sm font-bold text-slate-950">{{ price(publicService.price) }}</p>
        </div>

        <a
          class="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline focus:outline-2 focus:outline-indigo-700"
          [routerLink]="['/services', publicService.id]"
        >
          Ver detalle
        </a>
      </article>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicServiceMapCardComponent {
  readonly service = input<PublicService | null>(null);

  price(value: string | number): string {
    return formatPrice(value);
  }
}
