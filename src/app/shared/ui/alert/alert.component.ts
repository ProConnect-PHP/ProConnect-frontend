import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppAlertComponent {
  readonly message = input<string | null>(null);
  readonly variant = input<AlertVariant>('info');

  readonly classes = computed(() => {
    const base = 'rounded-lg border px-4 py-3';
    const variant = {
      info: 'border-blue-200 bg-blue-50 text-blue-900',
      success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      warning: 'border-amber-200 bg-amber-50 text-amber-950',
      danger: 'border-rose-200 bg-rose-50 text-rose-900',
    }[this.variant()];

    return `${base} ${variant}`;
  });
}
