import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppNotification } from '../../../core/notifications/models/notification.models';
import { NotificationNavigationService } from '../../../core/notifications/services/notification-navigation.service';
import { NotificationStore } from '../../../core/notifications/services/notification-store';
import {
  notificationTimeLabel,
  notificationTypeLabel,
} from '../../../core/notifications/utils/notification-grouping.util';

@Component({
  selector: 'app-notification-panel',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (store.isPanelOpen()) {
      <button
        type="button"
        class="fixed inset-0 z-40 cursor-default"
        tabindex="-1"
        aria-label="Cerrar panel de notificaciones"
        (click)="store.closePanel()"
      ></button>

      <section
        id="notification-panel"
        class="fixed inset-x-4 top-20 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
        role="dialog"
        aria-modal="false"
        aria-labelledby="notification-panel-title"
      >
        <header class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <h2 id="notification-panel-title" class="text-sm font-black text-slate-950">
              Notificaciones
            </h2>
            <p class="mt-0.5 text-xs text-slate-500">
              {{ store.unreadCount() }} sin leer
            </p>
          </div>

          <div class="flex items-center gap-1">
            @if (store.unreadCount() > 0) {
              <button
                type="button"
                class="rounded-lg px-2 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="store.markingAllAsRead()"
                (click)="store.markAllAsRead()"
              >
                Marcar todas
              </button>
            }

            <button
              type="button"
              class="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              aria-label="Cerrar panel de notificaciones"
              (click)="store.closePanel()"
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
        </header>

        @if (store.panelError()) {
          <div class="border-b border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-900" role="alert">
            {{ store.panelError() }}
          </div>
        }

        <div class="max-h-[min(26rem,65vh)] overflow-y-auto">
          @if (store.panelLoading()) {
            <div class="px-4 py-10 text-center text-sm font-medium text-slate-500" role="status">
              Cargando notificaciones...
            </div>
          } @else if (store.panelNotifications().length === 0) {
            <div class="px-5 py-10 text-center">
              <p class="text-sm font-bold text-slate-800">Estas al dia</p>
              <p class="mt-1 text-xs leading-5 text-slate-500">
                Las novedades de reservas, pagos y sesiones apareceran aca.
              </p>
            </div>
          } @else {
            <ul aria-label="Notificaciones recientes">
              @for (notification of store.panelNotifications(); track notification.id) {
                <li
                  class="border-b border-slate-100 last:border-b-0"
                  [class.bg-indigo-50]="!notification.is_read"
                >
                  <div class="flex items-start gap-2 px-3 py-3">
                    <button
                      type="button"
                      class="min-w-0 flex-1 rounded-lg px-1 py-0.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-wait"
                      [class.cursor-pointer]="hasRoute(notification)"
                      [class.cursor-default]="!hasRoute(notification)"
                      [disabled]="navigation.isPending(notification.id) || !hasRoute(notification)"
                      [attr.aria-label]="activationLabel(notification)"
                      (click)="activate(notification)"
                    >
                      <span class="flex items-center gap-2">
                        @if (!notification.is_read) {
                          <span class="size-2 shrink-0 rounded-full bg-indigo-600" aria-hidden="true"></span>
                        }
                        <span class="truncate text-sm font-bold text-slate-950">
                          {{ notification.title }}
                        </span>
                      </span>
                      <span class="mt-1 line-clamp-2 block text-xs leading-5 text-slate-600">
                        {{ notification.message }}
                      </span>
                      <span class="mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                        <span>{{ typeLabel(notification.type) }}</span>
                        <span aria-hidden="true">-</span>
                        <time [attr.datetime]="notification.created_at">
                          {{ timeLabel(notification) }}
                        </time>
                      </span>
                    </button>

                    <button
                      type="button"
                      class="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-wait disabled:opacity-50"
                      [disabled]="store.pendingArchiveIds().has(notification.id)"
                      [attr.aria-label]="'Archivar ' + notification.title"
                      (click)="archive($event, notification)"
                    >
                      <svg
                        class="size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M21 8v13H3V8" />
                        <path d="M1 3h22v5H1z" />
                        <path d="M10 12h4" />
                      </svg>
                    </button>
                  </div>
                </li>
              }
            </ul>
          }
        </div>

        <footer class="border-t border-slate-100 bg-slate-50 px-4 py-3">
          <a
            routerLink="/notifications"
            class="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
            (click)="store.closePanel()"
          >
            Ver historial completo
          </a>
        </footer>
      </section>
    }
  `,
})
export class NotificationPanelComponent {
  readonly store = inject(NotificationStore);
  readonly navigation = inject(NotificationNavigationService);

  activate(notification: AppNotification): void {
    this.navigation.activate(notification, () => this.store.closePanel());
  }

  archive(event: MouseEvent, notification: AppNotification): void {
    event.stopPropagation();
    this.store.archive(notification.id);
  }

  activationLabel(notification: AppNotification): string {
    return this.hasRoute(notification)
      ? `Abrir ${notification.title}`
      : `${notification.title} no tiene un destino disponible`;
  }

  hasRoute(notification: AppNotification): boolean {
    return this.navigation.resolveRoute(notification) !== null;
  }

  timeLabel(notification: AppNotification): string {
    return notificationTimeLabel(notification);
  }

  typeLabel(type: string): string {
    return notificationTypeLabel(type);
  }
}
