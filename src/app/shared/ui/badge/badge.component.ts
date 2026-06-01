import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppBadgeComponent {
  readonly variant = input<BadgeVariant>('neutral');

  readonly classes = computed(() => {
    const base = 'inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold';
    const variant = {
      neutral: 'bg-slate-100 text-slate-700',
      success: 'bg-emerald-100 text-emerald-800',
      warning: 'bg-amber-100 text-amber-900',
      danger: 'bg-rose-100 text-rose-800',
      info: 'bg-blue-100 text-blue-800',
    }[this.variant()];

    return `${base} ${variant}`;
  });
}
