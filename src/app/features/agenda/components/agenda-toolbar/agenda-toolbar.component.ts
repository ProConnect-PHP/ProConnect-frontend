import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-agenda-toolbar',
  template: `
    <section class="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div class="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline focus:outline-2 focus:outline-indigo-600"
          (click)="previous.emit()"
        >
          Semana anterior
        </button>

        <div class="text-center">
          <p class="text-xs font-bold uppercase tracking-wide text-slate-500">
            Semana
          </p>

          <h2 class="mt-1 text-lg font-black tracking-tight text-slate-950 sm:text-xl">
            {{ title() }}
          </h2>
        </div>

        <div class="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <button
            type="button"
            class="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline focus:outline-2 focus:outline-indigo-600"
            (click)="today.emit()"
          >
            Hoy
          </button>

          <button
            type="button"
            class="inline-flex min-h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus:outline focus:outline-2 focus:outline-slate-700"
            (click)="next.emit()"
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaToolbarComponent {
  readonly title = input.required<string>();

  readonly previous = output<void>();
  readonly today = output<void>();
  readonly next = output<void>();
}
