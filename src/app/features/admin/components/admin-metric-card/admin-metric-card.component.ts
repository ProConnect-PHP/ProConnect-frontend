import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-metric-card',
  template: `
    <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p class="text-sm font-bold text-slate-500">{{ label() }}</p>
      <p class="mt-3 text-3xl font-black tracking-tight text-slate-950">{{ value() }}</p>
      @if (description()) {
        <p class="mt-2 text-sm leading-6 text-slate-600">{{ description() }}</p>
      }
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMetricCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly description = input<string | null>(null);
}
