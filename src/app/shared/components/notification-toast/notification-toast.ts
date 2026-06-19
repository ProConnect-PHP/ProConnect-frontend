import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NotificationToastService } from '../../../core/notifications/services/notification-toast.service';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="pointer-events-none fixed inset-x-4 bottom-20 z-[60] flex flex-col items-end gap-2 sm:bottom-5 sm:left-auto sm:right-5"
      aria-label="Mensajes de la aplicacion"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-2xl"
          [class.bg-rose-800]="toast.variant === 'error'"
          [class.bg-emerald-800]="toast.variant === 'success'"
          [attr.role]="toast.variant === 'error' ? 'alert' : 'status'"
          [attr.aria-live]="toast.variant === 'error' ? 'assertive' : 'polite'"
        >
          <svg
            class="mt-0.5 size-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span class="min-w-0 flex-1 leading-5">{{ toast.message }}</span>
          <button
            type="button"
            class="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Cerrar mensaje"
            (click)="toastService.dismiss(toast.id)"
          >
            <svg
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  readonly toastService = inject(NotificationToastService);
}
