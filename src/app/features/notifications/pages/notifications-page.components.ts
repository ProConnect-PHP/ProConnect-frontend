import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificationStore } from '../../../core/notifications/services/notification-store';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications-page.component.html',
})
export class NotificationsPageComponent implements OnInit {
  protected readonly store = inject(NotificationStore);

  ngOnInit(): void {
    this.store.loadNotifications(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.store.lastPage()) return;
    this.store.loadNotifications(page);
  }

  confirmDeleteAll(): void {
    if (confirm('¿Eliminar todas las notificaciones? Esta acción no se puede deshacer.')) {
      this.store.deleteAll();
    }
  }
}