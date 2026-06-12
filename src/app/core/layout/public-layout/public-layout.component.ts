import { ChangeDetectionStrategy, Component, effect, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastComponent } from '../../../shared/components/notification-toast/notification-toast';
import { AuthStore } from '../../auth/services/auth.store';
import { NotificationStore } from '../../notifications/services/notification-store';
import { NotificationSocketService } from '../../notifications/services/notification-socket.service';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, ToastComponent, NotificationBellComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayoutComponent implements OnInit {

  private readonly authStore = inject(AuthStore);
  protected readonly notificationStore = inject(NotificationStore);
  private readonly notificationSocket = inject(NotificationSocketService);

  readonly isAuthenticated = this.authStore.isAuthenticated;

  constructor() {
    effect(() => {
      const userId = this.authStore.currentUser()?.id;
      if (userId) {
        this.notificationSocket.subscribe(userId);
      } else {
        this.notificationSocket.unsubscribe();
      }
    });
  }

  ngOnInit(): void {
  }
}