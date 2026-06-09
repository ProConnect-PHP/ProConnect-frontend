import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  inject,
  input,
  output,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  ProfessionalBookingReminderRule,
  ReminderRuleDraft,
} from '../../models/booking-policy.model';
import { BookingPolicyFieldErrors } from '../../utils/booking-policy-error.util';
import {
  atLeastOneChannelValidator,
  atLeastOneRecipientValidator,
  uniqueReminderTimeValidator,
} from '../../utils/booking-policy.validators';
import { PolicyTimeInputComponent } from '../policy-time-input/policy-time-input.component';

@Component({
  selector: 'app-reminder-rule-form-modal',
  imports: [ReactiveFormsModule, PolicyTimeInputComponent],
  host: {
    '(document:keydown.escape)': 'handleEscape()',
  },
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50">
        <button
          type="button"
          class="absolute inset-0 bg-slate-950/60"
          aria-label="Cerrar formulario de recordatorio"
          (click)="closed.emit()"
        ></button>

        <section
          class="absolute inset-0 overflow-y-auto bg-white p-5 shadow-2xl sm:inset-x-4 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[92vh] sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reminder-rule-title"
        >
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Recordatorio
                </p>
                <h2 id="reminder-rule-title" class="mt-2 text-2xl font-bold text-slate-950">
                  {{ editingRule() ? 'Editar recordatorio' : 'Agregar recordatorio' }}
                </h2>
                <p class="mt-1 text-sm leading-6 text-slate-600">
                  Elegi cuando se envia, por que canales y a quienes.
                </p>
              </div>
              <button
                type="button"
                class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline focus:outline-2 focus:outline-indigo-600"
                aria-label="Cerrar"
                (click)="closed.emit()"
              >
                X
              </button>
            </div>

            <div class="mt-6">
              <app-policy-time-input
                id="reminder-time"
                label="Enviar recordatorio"
                [valueMinutes]="form.controls.minutesBeforeStart.value"
                [minMinutes]="5"
                [maxMinutes]="10080"
                [autofocus]="true"
                [invalid]="
                  form.controls.minutesBeforeStart.touched &&
                  form.controls.minutesBeforeStart.invalid
                "
                describedBy="reminder-time-help reminder-time-error"
                (valueMinutesChange)="form.controls.minutesBeforeStart.setValue($event)"
              />
              <p id="reminder-time-help" class="mt-2 text-sm text-slate-500">
                Entre 5 minutos y 7 dias antes del inicio.
              </p>
              @if (
                form.controls.minutesBeforeStart.touched &&
                form.controls.minutesBeforeStart.invalid
              ) {
                <p id="reminder-time-error" class="mt-2 text-sm font-semibold text-rose-700">
                  Ingresa un tiempo valido entre 5 minutos y 7 dias.
                </p>
              }
              @if (form.hasError('duplicatedReminderTime')) {
                <p class="mt-2 text-sm font-semibold text-rose-700">
                  Ya existe una regla con ese tiempo.
                </p>
              }
              @if (serverErrors()['minutesBeforeStart']; as message) {
                <p class="mt-2 text-sm font-semibold text-rose-700">{{ message }}</p>
              }
            </div>

            <fieldset class="mt-6">
              <legend class="text-sm font-bold text-slate-900">Canales</legend>
              <div class="mt-3 grid gap-3 sm:grid-cols-2">
                @for (channel of channels; track channel.control) {
                  <label
                    class="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      class="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      [formControlName]="channel.control"
                    />
                    {{ channel.label }}
                  </label>
                }
              </div>
              @if (form.touched && form.hasError('atLeastOneChannel')) {
                <p class="mt-2 text-sm font-semibold text-rose-700">
                  Selecciona al menos un canal.
                </p>
              }
              @if (serverErrors()['channels']; as message) {
                <p class="mt-2 text-sm font-semibold text-rose-700">{{ message }}</p>
              }
            </fieldset>

            <fieldset class="mt-6">
              <legend class="text-sm font-bold text-slate-900">Destinatarios</legend>
              <div class="mt-3 grid gap-3 sm:grid-cols-2">
                <label
                  class="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    class="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    formControlName="notifyClient"
                  />
                  Cliente
                </label>
                <label
                  class="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    class="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    formControlName="notifyProfessional"
                  />
                  Profesional
                </label>
              </div>
              @if (form.touched && form.hasError('atLeastOneRecipient')) {
                <p class="mt-2 text-sm font-semibold text-rose-700">
                  Selecciona al menos un destinatario.
                </p>
              }
              @if (serverErrors()['recipients']; as message) {
                <p class="mt-2 text-sm font-semibold text-rose-700">{{ message }}</p>
              }
            </fieldset>

            <label
              class="mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-900"
            >
              <input
                type="checkbox"
                class="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                formControlName="isActive"
              />
              Mantener esta regla activa
            </label>

            @if (generalError()) {
              <p
                class="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"
                role="alert"
              >
                {{ generalError() }}
              </p>
            }

            <div class="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                class="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline focus:outline-2 focus:outline-indigo-600"
                [disabled]="saving()"
                (click)="closed.emit()"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="inline-flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline focus:outline-2 focus:outline-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="saving()"
              >
                {{ saving() ? 'Guardando...' : 'Guardar recordatorio' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReminderRuleFormModalComponent implements OnChanges {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly open = input(false);
  readonly editingRule = input<ProfessionalBookingReminderRule | null>(null);
  readonly existingRules = input<ProfessionalBookingReminderRule[]>([]);
  readonly saving = input(false);
  readonly generalError = input<string | null>(null);
  readonly serverErrors = input<BookingPolicyFieldErrors>({});

  readonly closed = output<void>();
  readonly saved = output<ReminderRuleDraft>();

  readonly channels = [
    { control: 'sendEmail', label: 'Email' },
    { control: 'sendDatabaseNotification', label: 'Notificacion en plataforma' },
    { control: 'sendPush', label: 'Push' },
    { control: 'sendWhatsapp', label: 'WhatsApp' },
  ] as const;

  readonly form = this.fb.group(
    {
      minutesBeforeStart: [120, [Validators.required, Validators.min(5), Validators.max(10080)]],
      sendEmail: [true],
      sendDatabaseNotification: [true],
      sendPush: [false],
      sendWhatsapp: [false],
      notifyClient: [true],
      notifyProfessional: [false],
      isActive: [true],
    },
    {
      validators: [atLeastOneChannelValidator(), atLeastOneRecipientValidator()],
    },
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open']?.currentValue) return;

    const rule = this.editingRule();
    this.form.reset({
      minutesBeforeStart: rule?.minutesBeforeStart ?? 120,
      sendEmail: rule?.sendEmail ?? true,
      sendDatabaseNotification: rule?.sendDatabaseNotification ?? true,
      sendPush: rule?.sendPush ?? false,
      sendWhatsapp: rule?.sendWhatsapp ?? false,
      notifyClient: rule?.notifyClient ?? true,
      notifyProfessional: rule?.notifyProfessional ?? false,
      isActive: rule?.isActive ?? true,
    });
    this.form.setValidators([
      atLeastOneChannelValidator(),
      atLeastOneRecipientValidator(),
      uniqueReminderTimeValidator(this.existingRules(), rule?.id),
    ]);
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.invalid || this.saving()) return;

    this.saved.emit(this.form.getRawValue());
  }

  handleEscape(): void {
    if (this.open() && !this.saving()) this.closed.emit();
  }
}
