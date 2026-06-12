import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { NotificationStore } from '../../../core/notifications/services/notification-store';
import { NotificationPanelComponent } from '../notification-panel/notification-panel.component';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [NotificationPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <button
        type="button"
        class="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 transition focus:outline focus:outline-2"
        aria-label="Notificaciones"
        (click)="store.togglePanel()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        @if (store.unreadCount() > 0) {
          <span class="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
            {{ store.unreadCount() > 99 ? '99+' : store.unreadCount() }}
          </span>
        }
      </button>

      <app-notification-panel />
    </div>
  `,
})
export class NotificationBellComponent implements OnInit {
  protected readonly store = inject(NotificationStore);

  ngOnInit(): void {
    this.store.loadUnreadCount();
  }
}