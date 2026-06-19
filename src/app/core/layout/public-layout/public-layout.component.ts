import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastComponent } from '../../../shared/components/notification-toast/notification-toast';
import { AuthStore } from '../../auth/services/auth.store';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-public-layout',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ToastComponent,
    NotificationBellComponent,
  ],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayoutComponent {
  private readonly authStore = inject(AuthStore);

  readonly isAuthenticated = this.authStore.isAuthenticated;
  readonly accountButtonLabel = computed(() => {
    const name = this.authStore.currentUser()?.name.trim();

    return name?.split(/\s+/)[0] || 'Mi cuenta';
  });

  readonly isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
