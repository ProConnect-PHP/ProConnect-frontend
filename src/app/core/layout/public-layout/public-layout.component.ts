import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastComponent } from '../../../shared/components/notification-toast/notification-toast';
import { AuthStore } from '../../auth/services/auth.store';
import { NotificationStore } from '../../notifications/services/notification-store';
import { NotificationSocketService } from '../../notifications/services/notification-socket.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, ToastComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayoutComponent {

  private readonly authStore = inject(AuthStore);
  protected readonly notificationStore = inject(NotificationStore);
  protected readonly notificationSocket = inject(NotificationSocketService);

  readonly isAuthenticated = this.authStore.isAuthenticated;

  constructor() {
    effect(() => {
      const userId = this.authStore.currentUser()?.id;
      if (userId) {
        this.notificationStore.loadUnreadCount();
        this.notificationSocket.subscribe(userId);
      } else {
        this.notificationSocket.unsubscribe();
      }
    });
  }
}