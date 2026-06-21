import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProfessionalAgendaSummary } from '../../data-access/professional-agenda.models';


@Component({
  selector: 'app-agenda-summary-cards',
  template: `
    <section class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Total histórico</p>
        <p class="mt-2 text-2xl font-black text-slate-950">{{ summary().total }}</p>
      </article>

      <article class="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wide text-amber-700">Pendientes</p>
        <p class="mt-2 text-2xl font-black text-amber-950">{{ summary().pending }}</p>
      </article>

      <article class="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wide text-indigo-700">Confirmadas</p>
        <p class="mt-2 text-2xl font-black text-indigo-950">{{ summary().confirmed }}</p>
      </article>

      <article class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wide text-emerald-700">Pagadas</p>
        <p class="mt-2 text-2xl font-black text-emerald-950">{{ summary().paid }}</p>
      </article>

      <article class="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wide text-sky-700">En curso</p>
        <p class="mt-2 text-2xl font-black text-sky-950">{{ summary().in_progress }}</p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Finalizadas</p>
        <p class="mt-2 text-2xl font-black text-slate-950">{{ summary().completed }}</p>
      </article>

      <article class="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wide text-rose-700">Canceladas</p>
        <p class="mt-2 text-2xl font-black text-rose-950">{{ summary().cancelled }}</p>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaSummaryCardsComponent {
  readonly summary = input.required<ProfessionalAgendaSummary>();
}
