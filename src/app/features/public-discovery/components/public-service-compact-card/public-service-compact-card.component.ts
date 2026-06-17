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
      <div class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
        <div class="min-w-0">
          <app-public-modality-badge [modality]="service().modality" />

          <h3 class="mt-3 line-clamp-2 text-base font-black tracking-tight text-slate-950 sm:text-sm">
            {{ service().name }}
          </h3>

          @if (service().address) {
            <p class="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 sm:line-clamp-1">
              {{ service().address }}
            </p>
          }
        </div>

        <p class="inline-flex w-fit items-center rounded-2xl bg-slate-950 px-3 py-2 text-xs font-black text-white sm:shrink-0">
          {{ price(service().price) }}
        </p>
      </div>

      <div class="mt-4 grid gap-2 sm:grid-cols-2">
        <a
          class="inline-flex min-h-11 items-center justify-center rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline focus:outline-2 focus:outline-indigo-700"
          [routerLink]="['/services', service().id]"
        >
          Ver detalle
        </a>

        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline focus:outline-2 focus:outline-indigo-600"
          (click)="serviceSelected.emit(service().id)"
        >
          Ver en mapa
        </button>
      </div>
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
