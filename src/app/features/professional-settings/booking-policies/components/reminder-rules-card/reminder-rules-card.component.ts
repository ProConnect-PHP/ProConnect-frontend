import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { ProfessionalBookingReminderRule } from '../../models/booking-policy.model';
import { formatMinutesBefore } from '../../utils/time-options.util';

@Component({
  selector: 'app-reminder-rules-card',
  imports: [ReactiveFormsModule],
  template: `
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Automatizacion</p>
        <h2 class="mt-2 text-xl font-bold text-slate-950">Recordatorios automaticos</h2>
        <p class="mt-1 text-sm leading-6 text-slate-600">
          Envia avisos antes de cada sesion para reducir ausencias.
        </p>
      </div>

      <label
        class="mt-5 flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
      >
        <span>
          <span class="block text-sm font-bold text-slate-900">
            Activar recordatorios automaticos
          </span>
          <span class="mt-1 block text-sm leading-5 text-slate-600">
            Este cambio se aplica cuando guardes la configuracion general.
          </span>
        </span>
        <span class="relative mt-0.5 inline-flex shrink-0">
          <input
            type="checkbox"
            class="peer sr-only"
            [formControl]="enabledControl()"
            aria-label="Activar recordatorios automaticos"
          />
          <span
            class="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-indigo-600 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-600"
          ></span>
          <span
            class="absolute left-1 top-1 size-4 rounded-full bg-white shadow transition peer-checked:translate-x-5"
          ></span>
        </span>
      </label>

      @if (!enabledControl().value) {
        <p class="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-950">
          Los recordatorios estan desactivados. Podes editar tus reglas, pero no se enviaran
          hasta que actives esta opcion y guardes.
        </p>
      }

      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-base font-bold text-slate-950">Recordatorios configurados</h3>
          <p class="mt-1 text-sm text-slate-500">
            Las altas, ediciones y eliminaciones se guardan inmediatamente.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          [disabled]="saving()"
          (click)="addClicked.emit()"
        >
          + Agregar recordatorio
        </button>
      </div>

      @if (rules().length === 0) {
        <div class="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p class="font-bold text-slate-900">Todavia no configuraste recordatorios.</p>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Agrega uno para avisar a tus clientes antes de cada sesion.
          </p>
          <button
            type="button"
            class="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 focus:outline focus:outline-2 focus:outline-indigo-600"
            [disabled]="saving()"
            (click)="addClicked.emit()"
          >
            Agregar primer recordatorio
          </button>
        </div>
      } @else {
        <div class="mt-5 grid gap-3">
          @for (rule of rules(); track rule.id) {
            <article
              class="rounded-xl border border-slate-200 bg-slate-50 p-4"
              [class.opacity-60]="!rule.isActive"
            >
              <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p class="font-bold text-slate-950">{{ timeLabel(rule.minutesBeforeStart) }}</p>
                  <p class="mt-1 text-sm leading-5 text-slate-600">
                    {{ channelLabel(rule) }}
                  </p>
                  <p class="mt-1 text-sm leading-5 text-slate-600">
                    Destinatario: {{ recipientLabel(rule) }}
                  </p>
                </div>
                <span
                  class="w-fit rounded-full px-2.5 py-1 text-xs font-bold"
                  [class.bg-emerald-100]="rule.isActive"
                  [class.text-emerald-800]="rule.isActive"
                  [class.bg-slate-200]="!rule.isActive"
                  [class.text-slate-700]="!rule.isActive"
                >
                  {{ rule.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>

              <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  class="min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 focus:outline focus:outline-2 focus:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                  [disabled]="saving()"
                  (click)="editClicked.emit(rule)"
                >
                  Editar
                </button>
                <button
                  type="button"
                  class="min-h-10 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 focus:outline focus:outline-2 focus:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                  [disabled]="saving()"
                  (click)="toggleClicked.emit(rule)"
                >
                  @if (activeRuleId() === rule.id) {
                    Guardando...
                  } @else {
                    {{ rule.isActive ? 'Desactivar' : 'Activar' }}
                  }
                </button>
                <button
                  type="button"
                  class="min-h-10 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50 focus:outline focus:outline-2 focus:outline-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  [disabled]="saving()"
                  (click)="deleteClicked.emit(rule)"
                >
                  Eliminar
                </button>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReminderRulesCardComponent {
  readonly enabledControl = input.required<FormControl<boolean>>();
  readonly rules = input.required<ProfessionalBookingReminderRule[]>();
  readonly saving = input(false);
  readonly activeRuleId = input<string | 'new' | null>(null);

  readonly addClicked = output<void>();
  readonly editClicked = output<ProfessionalBookingReminderRule>();
  readonly toggleClicked = output<ProfessionalBookingReminderRule>();
  readonly deleteClicked = output<ProfessionalBookingReminderRule>();

  timeLabel(minutes: number): string {
    return formatMinutesBefore(minutes);
  }

  channelLabel(rule: ProfessionalBookingReminderRule): string {
    const channels = [
      rule.sendEmail ? 'Email' : null,
      rule.sendDatabaseNotification ? 'Notificacion en plataforma' : null,
      rule.sendPush ? 'Push' : null,
      rule.sendWhatsapp ? 'WhatsApp' : null,
    ].filter((channel): channel is string => channel !== null);

    return channels.join(' + ');
  }

  recipientLabel(rule: ProfessionalBookingReminderRule): string {
    if (rule.notifyClient && rule.notifyProfessional) return 'Cliente + Profesional';
    if (rule.notifyProfessional) return 'Profesional';
    return 'Cliente';
  }
}
