import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import {
  AppNotification,
  NotificationStatus,
} from '../../../core/notifications/models/notification.models';
import { NotificationNavigationService } from '../../../core/notifications/services/notification-navigation.service';
import { NotificationStore } from '../../../core/notifications/services/notification-store';
import {
  notificationTimeLabel,
  notificationTypeLabel,
} from '../../../core/notifications/utils/notification-grouping.util';

@Component({
  selector: 'app-notifications-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications-page.components.html',
})
export class NotificationsPageComponent implements OnInit {
  protected readonly store = inject(NotificationStore);
  protected readonly navigation = inject(NotificationNavigationService);

  ngOnInit(): void {
    this.store.loadFirstPage();
  }

  selectStatus(status: NotificationStatus): void {
    this.store.selectStatus(status);
  }

  activate(notification: AppNotification): void {
    this.navigation.activate(notification);
  }

  markAsRead(notificationId: string): void {
    this.store.markAsRead(notificationId).subscribe({
      error: () => undefined,
    });
  }

  toggleArchive(event: MouseEvent, notification: AppNotification): void {
    event.stopPropagation();

    if (notification.is_archived) {
      this.store.unarchive(notification.id);
      return;
    }

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

  emptyTitle(): string {
    switch (this.store.selectedStatus()) {
      case 'archived':
        return 'No hay notificaciones archivadas';
      case 'all':
        return 'Todavia no hay notificaciones';
      default:
        return 'Estas al dia';
    }
  }

  emptyDescription(): string {
    switch (this.store.selectedStatus()) {
      case 'archived':
        return 'Las notificaciones que archives van a permanecer disponibles en este historial.';
      case 'all':
        return 'Cuando haya actividad en tu cuenta, vas a encontrarla agrupada por dia.';
      default:
        return 'No tenes notificaciones activas. Podes consultar las archivadas cuando quieras.';
    }
  }
}
