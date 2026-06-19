import { Injectable, effect, inject } from '@angular/core';

import { AuthStore } from '../auth/services/auth.store';
import { NotificationSocketService } from '../notifications/services/notification-socket.service';
import { NotificationStore } from '../notifications/services/notification-store';

@Injectable({ providedIn: 'root' })
export class AuthWebsocketBridge {
  private readonly authStore = inject(AuthStore);
  private readonly socket = inject(NotificationSocketService);
  private readonly store = inject(NotificationStore);

  constructor() {
    let activeUserId: string | null = null;

    effect(() => {
      const userId = this.authStore.currentUser()?.id ?? null;
      if (userId === activeUserId) return;

      this.socket.unsubscribe();
      this.store.reset();
      activeUserId = userId;

      if (!userId) return;

      this.store.loadUnreadCount(true);
      this.socket.subscribe(userId);
    });
  }
}
