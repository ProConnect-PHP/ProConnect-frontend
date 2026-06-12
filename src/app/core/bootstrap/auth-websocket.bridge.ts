import { Injectable, effect, inject } from '@angular/core';
import { AuthStore } from '../auth/services/auth.store';
import { NotificationSocketService } from '../notifications/services/notification-socket.service';

@Injectable({ providedIn: 'root' })
export class AuthWebsocketBridge {

  private readonly authStore = inject(AuthStore);
  private readonly notifications = inject(NotificationSocketService);

  constructor() {
    this.init();
  }

  private init(): void {
  let lastUserId: string | null = null;

  effect(() => {
    const user = this.authStore.currentUser();
    console.log('[AuthWebsocketBridge] effect disparado, user:', user);

    if (!user) return;
    if (lastUserId === user.id) return;

    lastUserId = user.id;
    console.log('[AuthWebsocketBridge] subscribe a:', user.id);
    this.notifications.subscribe(user.id);
  });
}
}