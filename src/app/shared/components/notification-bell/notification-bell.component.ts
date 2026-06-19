import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  inject,
  viewChild,
} from '@angular/core';

import { NotificationStore } from '../../../core/notifications/services/notification-store';
import { NotificationPanelComponent } from '../notification-panel/notification-panel.component';

@Component({
  selector: 'app-notification-bell',
  imports: [NotificationPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeFromKeyboard()',
  },
  template: `
    <div class="relative">
      <button
        #bellButton
        type="button"
        class="relative inline-flex size-11 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        aria-label="Abrir notificaciones"
        aria-haspopup="dialog"
        aria-controls="notification-panel"
        [attr.aria-expanded]="store.isPanelOpen()"
        (click)="store.togglePanel()"
      >
        <svg
          class="size-5"
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

        @if (store.unreadCount() > 0) {
          <span
            class="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-indigo-700 px-1 text-[10px] font-black leading-5 text-white"
            aria-hidden="true"
          >
            {{ store.unreadCount() > 99 ? '99+' : store.unreadCount() }}
          </span>
          <span class="sr-only">{{ store.unreadCount() }} notificaciones sin leer</span>
        }
      </button>

      <app-notification-panel />
    </div>
  `,
})
export class NotificationBellComponent implements OnInit {
  protected readonly store = inject(NotificationStore);
  private readonly bellButton = viewChild<ElementRef<HTMLButtonElement>>('bellButton');

  ngOnInit(): void {
    this.store.loadUnreadCount();
  }

  closeFromKeyboard(): void {
    if (!this.store.isPanelOpen()) return;
    this.store.closePanel();
    this.bellButton()?.nativeElement.focus();
  }
}
