import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { PolicyTimeInputComponent } from '../policy-time-input/policy-time-input.component';

@Component({
  selector: 'app-cancellation-policy-card',
  imports: [ReactiveFormsModule, PolicyTimeInputComponent],
  template: `
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Politica</p>
        <h2 class="mt-2 text-xl font-bold text-slate-950">Cancelaciones</h2>
        <p class="mt-1 text-sm leading-6 text-slate-600">
          Defini si tus clientes pueden cancelar sesiones desde la plataforma.
        </p>
      </div>

      <label
        class="mt-5 flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
      >
        <span>
          <span class="block text-sm font-bold text-slate-900">
            Permitir cancelaciones online
          </span>
          <span class="mt-1 block text-sm leading-5 text-slate-600">
            Tus clientes podran cancelar desde su panel.
          </span>
        </span>
        <span class="relative mt-0.5 inline-flex shrink-0">
          <input
            type="checkbox"
            class="peer sr-only"
            [formControl]="allowControl()"
            aria-label="Permitir cancelaciones online"
          />
          <span
            class="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-indigo-600 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-600"
          ></span>
          <span
            class="absolute left-1 top-1 size-4 rounded-full bg-white shadow transition peer-checked:translate-x-5"
          ></span>
        </span>
      </label>

      @if (!allowControl().value) {
        <p class="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-950">
          Los clientes no podran cancelar desde la plataforma. Podran contactarte por fuera
          de ProConnect.
        </p>
      }

      <div class="mt-5 grid gap-5">
        <div>
          <app-policy-time-input
            id="cancellation-cutoff"
            label="Los clientes podran cancelar hasta"
            [valueMinutes]="cutoffControl().value"
            [disabled]="cutoffControl().disabled"
            [invalid]="cutoffControl().touched && cutoffControl().invalid"
            describedBy="cancellation-cutoff-help cancellation-cutoff-error"
            (valueMinutesChange)="cutoffControl().setValue($event)"
          />
          <p id="cancellation-cutoff-help" class="mt-2 text-sm text-slate-500">
            El maximo permitido es 7 dias antes de la sesion.
          </p>
          @if (cutoffControl().touched && cutoffControl().invalid) {
            <p id="cancellation-cutoff-error" class="mt-2 text-sm font-semibold text-rose-700">
              Ingresa un tiempo entre 0 minutos y 7 dias.
            </p>
          }
          @if (cutoffServerError()) {
            <p class="mt-2 text-sm font-semibold text-rose-700">{{ cutoffServerError() }}</p>
          }
        </div>

        <div>
          <label for="cancellation-policy-text" class="text-sm font-semibold text-slate-800">
            Mensaje visible para clientes
          </label>
          <textarea
            id="cancellation-policy-text"
            rows="4"
            maxlength="2000"
            [formControl]="policyTextControl()"
            [attr.aria-invalid]="policyTextControl().touched && policyTextControl().invalid"
            aria-describedby="cancellation-text-help cancellation-text-error"
            class="mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            placeholder="Podes cancelar hasta 2 horas antes del inicio de la sesion."
          ></textarea>
          <p id="cancellation-text-help" class="mt-2 text-sm text-slate-500">
            Este texto ayuda a explicar la politica antes de que el cliente reserve.
          </p>
          @if (policyTextControl().touched && policyTextControl().hasError('maxlength')) {
            <p id="cancellation-text-error" class="mt-2 text-sm font-semibold text-rose-700">
              El mensaje no puede superar los 2000 caracteres.
            </p>
          }
          @if (textServerError()) {
            <p class="mt-2 text-sm font-semibold text-rose-700">{{ textServerError() }}</p>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CancellationPolicyCardComponent {
  readonly allowControl = input.required<FormControl<boolean>>();
  readonly cutoffControl = input.required<FormControl<number>>();
  readonly policyTextControl = input.required<FormControl<string>>();
  readonly cutoffServerError = input<string | null>(null);
  readonly textServerError = input<string | null>(null);
}
