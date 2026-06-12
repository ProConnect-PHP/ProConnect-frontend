import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationStore } from '../../../core/notifications/services/notification-store';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (store.isPanelOpen()) {
      <!-- Backdrop para cerrar al hacer click afuera -->
      <div class="fixed inset-0 z-40" (click)="store.closePanel()"></div>

      <div
        class="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-lg"
      >
        <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p class="text-sm font-semibold text-slate-950">Notificaciones</p>
        </div>

        <div class="max-h-80 overflow-y-auto">
          @if (store.isLoading()) {
            <p class="px-4 py-6 text-center text-sm text-slate-500">Cargando...</p>
          } @else if (store.notifications().length === 0) {
            <p class="px-4 py-6 text-center text-sm text-slate-500">No tenés notificaciones</p>
          } @else {
            @for (n of store.notifications(); track n.id) {
              <div
                class="flex items-start gap-2 border-b border-slate-50 px-4 py-3 last:border-b-0 hover:bg-slate-50"
                [class.bg-sky-50]="!n.read_at"
              >
                <div class="flex-1 text-sm text-slate-700">
                  <div class="flex items-center gap-2">
                    <p class="font-semibold text-slate-950">{{ n.title }}</p>
                    @if (!n.read_at) {
                      <span class="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700">
                        <span class="size-1.5 rounded-full bg-sky-500"></span>
                        Nueva
                      </span>
                    }
                  </div>
                  <p>{{ n.message }}</p>
                  <p class="mt-1 text-xs text-slate-400">{{ n.created_at | date:'short' }}</p>
                </div>
                <button
                  type="button"
                  class="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Eliminar notificación"
                  (click)="store.deleteNotification(n.id)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"/>
                    <path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>
            }
          }
        </div>

        @if (store.notifications().length > 0) {
          <div class="border-t border-slate-100 px-4 py-2">
            <button
              type="button"
              class="w-full rounded-md px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              (click)="store.deleteAll()"
            >
              Eliminar todas
            </button>
          </div>
        }
      </div>
    }
  `,
})
export class NotificationPanelComponent {
  readonly store = inject(NotificationStore);
}