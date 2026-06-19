import { Injectable, inject } from '@angular/core';

import { EchoService } from '../websocket/echo.service';
import { NotificationStore } from './notification-store';
import { NotificationToastService } from './notification-toast.service';

@Injectable({ providedIn: 'root' })
export class NotificationSocketService {
  private readonly echo = inject(EchoService);
  private readonly toast = inject(NotificationToastService);
  private readonly store = inject(NotificationStore);
  private currentUserId: string | null = null;

  subscribe(userId: string): void {
    if (this.currentUserId === userId) return;
    this.unsubscribe();

    const channelName = `notifications.${userId}`;
    this.currentUserId = userId;

    void this.echo
      .listenPrivate(channelName, '.notification.created', (payload) => {
        const notification = this.store.receiveRealtime(payload);
        if (!notification) return;

        this.toast.show(notification.title || 'Recibiste una nueva notificacion.');
      })
      .then((didSubscribe) => {
        if (didSubscribe && this.currentUserId !== userId) {
          this.echo.leave(channelName);
        }

        if (!didSubscribe && this.currentUserId === userId) {
          this.currentUserId = null;
        }
      });
  }

  unsubscribe(): void {
    if (!this.currentUserId) return;
    this.echo.leave(`notifications.${this.currentUserId}`);
    this.currentUserId = null;
  }
}
