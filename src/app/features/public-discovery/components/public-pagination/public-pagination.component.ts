import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { PublicServicesMeta } from '../../models/public-discovery.models';

@Component({
  selector: 'app-public-pagination',
  template: `
    @if (meta(); as pagination) {
      @if (pagination.last_page > 1) {
        <nav
          class="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          aria-label="Paginacion de servicios"
        >
          <p class="text-sm text-slate-600">
            Pagina {{ pagination.current_page }} de {{ pagination.last_page }}
          </p>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex min-h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline focus:outline-2 focus:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
              [disabled]="!canGoPrevious()"
              (click)="goToPage(pagination.current_page - 1)"
            >
              Anterior
            </button>
            <button
              type="button"
              class="inline-flex min-h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline focus:outline-2 focus:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
              [disabled]="!canGoNext()"
              (click)="goToPage(pagination.current_page + 1)"
            >
              Siguiente
            </button>
          </div>
        </nav>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicPaginationComponent {
  readonly meta = input<PublicServicesMeta | null>(null);
  readonly pageChange = output<number>();

  readonly canGoPrevious = computed(() => {
    const meta = this.meta();
    return !!meta && meta.current_page > 1;
  });

  readonly canGoNext = computed(() => {
    const meta = this.meta();
    return !!meta && meta.current_page < meta.last_page;
  });

  goToPage(page: number): void {
    const meta = this.meta();
    if (!meta || page < 1 || page > meta.last_page) return;
    this.pageChange.emit(page);
  }
}
