import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<ButtonType>('button');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly fullWidth = input(false);

  readonly classes = computed(() => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-md font-semibold shadow-sm transition focus:outline focus:outline-2 disabled:cursor-not-allowed disabled:opacity-60';
    const width = this.fullWidth() ? 'w-full' : '';
    const size = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-5 py-3 text-base',
    }[this.size()];
    const variant = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-blue-700',
      secondary:
        'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus:outline-slate-500',
      ghost: 'bg-transparent text-slate-700 shadow-none hover:bg-slate-100 focus:outline-slate-500',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:outline-rose-700',
    }[this.variant()];

    return [base, width, size, variant].join(' ');
  });
}
