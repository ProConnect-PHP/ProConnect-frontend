import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-public-service-skeleton',
  template: `
    <article
      class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-label="Cargando servicio"
    >
      <div class="animate-pulse">
        <div class="flex items-start justify-between gap-4">
          <div class="h-5 w-2/3 rounded bg-slate-200"></div>
          <div class="h-7 w-20 rounded-md bg-slate-200"></div>
        </div>
        <div class="mt-4 h-4 w-full rounded bg-slate-200"></div>
        <div class="mt-2 h-4 w-4/5 rounded bg-slate-200"></div>
        <div class="mt-5 flex gap-2">
          <div class="h-7 w-20 rounded-md bg-slate-200"></div>
          <div class="h-7 w-24 rounded-md bg-slate-200"></div>
          <div class="h-7 w-20 rounded-md bg-slate-200"></div>
        </div>
        <div class="mt-6 flex items-center gap-3">
          <div class="size-10 rounded-full bg-slate-200"></div>
          <div class="flex-1">
            <div class="h-4 w-32 rounded bg-slate-200"></div>
            <div class="mt-2 h-3 w-24 rounded bg-slate-200"></div>
          </div>
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicServiceSkeletonComponent {}
