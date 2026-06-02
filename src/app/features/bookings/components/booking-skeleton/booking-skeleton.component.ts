import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-booking-skeleton',
  template: `
    <article class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm" aria-hidden="true">
      <div class="animate-pulse">
        <div class="h-4 w-28 rounded bg-slate-200"></div>
        <div class="mt-4 h-6 w-3/4 rounded bg-slate-200"></div>
        <div class="mt-3 h-4 w-full rounded bg-slate-200"></div>
        <div class="mt-2 h-4 w-2/3 rounded bg-slate-200"></div>
        <div class="mt-5 flex gap-2">
          <div class="h-10 w-28 rounded bg-slate-200"></div>
          <div class="h-10 w-24 rounded bg-slate-200"></div>
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingSkeletonComponent {}
