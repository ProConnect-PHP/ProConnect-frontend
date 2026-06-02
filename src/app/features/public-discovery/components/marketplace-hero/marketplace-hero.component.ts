import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { PublicServiceSearchBarComponent } from '../public-service-search-bar/public-service-search-bar.component';

@Component({
  selector: 'app-marketplace-hero',
  imports: [PublicServiceSearchBarComponent],
  template: `
    <section class="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div class="grid gap-6 lg:grid-cols-[1fr_560px] lg:items-end">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Marketplace
            </p>
            <h1 class="mt-3 max-w-2xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Encontra profesionales para lo que necesitas
            </h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Compara servicios, modalidades, precios y disponibilidad en un solo lugar.
            </p>
          </div>

          <app-public-service-search-bar
            [value]="search()"
            (searchChange)="searchChanged.emit($event)"
          />
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceHeroComponent {
  readonly search = input<string | null | undefined>(null);
  readonly searchChanged = output<string | null>();
}
