import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationToastService } from '../../../core/notifications/services/notification-toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3
                 text-sm font-medium text-white shadow-lg
                 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <span class="text-base">🔔</span>
          <span>{{ toast.message }}</span>
          <button
            (click)="toastService.dismiss(toast.id)"
            class="ml-2 rounded-full p-0.5 opacity-60 hover:opacity-100 transition"
            aria-label="Cerrar"
          >✕</button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  readonly toastService = inject(NotificationToastService);
}