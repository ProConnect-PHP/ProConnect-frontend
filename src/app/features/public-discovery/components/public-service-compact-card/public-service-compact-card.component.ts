import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PublicService } from '../../models/public-discovery.models';
import { formatPrice } from '../../utils/price-format.util';
import { PublicModalityBadgeComponent } from '../public-modality-badge/public-modality-badge.component';

@Component({
  selector: 'app-public-service-compact-card',
  imports: [RouterLink, PublicModalityBadgeComponent],
  template: `
    <article
      class="rounded-3xl border bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
      [class.border-indigo-300]="selected()"
      [class.ring-4]="selected()"
      [class.ring-indigo-100]="selected()"
      [class.border-slate-200]="!selected()"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <app-public-modality-badge [modality]="service().modality" />
          <h3 class="mt-3 line-clamp-2 text-sm font-black tracking-tight text-slate-950">
            {{ service().name }}
          </h3>
          @if (service().address) {
            <p class="mt-1 line-clamp-1 text-xs text-slate-500">{{ service().address }}</p>
          }
        </div>
        <p class="shrink-0 rounded-2xl bg-slate-950 px-3 py-2 text-xs font-black text-white">
          {{ price(service().price) }}
        </p>
      </div>

      <a
        class="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline focus:outline-2 focus:outline-indigo-700"
        [routerLink]="['/services', service().id]"
      >
        Ver detalle
      </a>

      <button
        type="button"
        class="mt-2 inline-flex min-h-10 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline focus:outline-2 focus:outline-indigo-600"
        (click)="serviceSelected.emit(service().id)"
      >
        Ver en mapa
      </button>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicServiceCompactCardComponent {
  readonly service = input.required<PublicService>();
  readonly selected = input(false);
  readonly serviceSelected = output<string | number>();

  price(value: string | number): string {
    return formatPrice(value);
  }
}
