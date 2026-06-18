import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthStore } from '../../../../core/auth/services/auth.store';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-layout-page',
  host: {
    class: 'block w-full min-w-0',
  },
  imports: [RouterLink, RouterOutlet, AdminSidebarComponent],
  templateUrl: './admin-layout-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentUser = this.authStore.currentUser;

  logout(): void {
    this.authStore
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigateByUrl('/login'),
        error: () => void this.router.navigateByUrl('/login'),
      });
  }
}
