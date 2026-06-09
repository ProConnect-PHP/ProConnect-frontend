import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import {
  TimeUnit,
  minutesToTimeValue,
  timeValueToMinutes,
} from '../../utils/time-options.util';

@Component({
  selector: 'app-policy-time-input',
  template: `
    <fieldset [disabled]="disabled()" class="grid gap-2">
      <legend class="text-sm font-semibold text-slate-800">{{ label() }}</legend>
      <div class="grid grid-cols-[minmax(0,1fr)_minmax(9rem,0.75fr)] gap-3">
        <label class="sr-only" [for]="id() + '-value'">Cantidad</label>
        <input
          [id]="id() + '-value'"
          type="number"
          inputmode="numeric"
          step="1"
          [min]="minimumValue()"
          [max]="maximumValue()"
          [value]="timeValue().value"
          [attr.aria-invalid]="invalid()"
          [attr.aria-describedby]="describedBy()"
          [attr.autofocus]="autofocus() ? '' : null"
          class="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          (input)="changeValue($event)"
        />

        <label class="sr-only" [for]="id() + '-unit'">Unidad</label>
        <select
          [id]="id() + '-unit'"
          [value]="timeValue().unit"
          [attr.aria-describedby]="describedBy()"
          class="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          (change)="changeUnit($event)"
        >
          <option value="minutes">minutos antes</option>
          <option value="hours">horas antes</option>
          <option value="days">dias antes</option>
        </select>
      </div>
    </fieldset>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PolicyTimeInputComponent {
  readonly id = input.required<string>();
  readonly valueMinutes = input.required<number>();
  readonly disabled = input(false);
  readonly label = input.required<string>();
  readonly maxMinutes = input(10080);
  readonly minMinutes = input(0);
  readonly invalid = input(false);
  readonly describedBy = input<string | null>(null);
  readonly autofocus = input(false);
  readonly valueMinutesChange = output<number>();

  readonly timeValue = computed(() => minutesToTimeValue(this.valueMinutes()));
  readonly minimumValue = computed(() =>
    Math.ceil(this.minMinutes() / multiplierFor(this.timeValue().unit)),
  );
  readonly maximumValue = computed(() =>
    Math.floor(this.maxMinutes() / multiplierFor(this.timeValue().unit)),
  );

  changeValue(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.valueMinutesChange.emit(
      timeValueToMinutes(Number.isFinite(value) ? value : 0, this.timeValue().unit),
    );
  }

  changeUnit(event: Event): void {
    const unit = (event.target as HTMLSelectElement).value as TimeUnit;
    this.valueMinutesChange.emit(timeValueToMinutes(this.timeValue().value, unit));
  }
}

function multiplierFor(unit: TimeUnit): number {
  return timeValueToMinutes(1, unit);
}
