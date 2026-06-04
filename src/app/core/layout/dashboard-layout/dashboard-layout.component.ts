import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthStore } from '../../auth/services/auth.store';

type NavigationItem = {
  label: string;
  path: string;
  shortLabel: string;
};

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayoutComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly userName = computed(() => this.authStore.currentUser()?.name ?? 'Tu cuenta');

  readonly navigation: NavigationItem[] = [
    { label: 'Dashboard', shortLabel: 'Inicio', path: '/dashboard' },
    { label: 'Perfil profesional', shortLabel: 'Perfil', path: '/dashboard/profile' },
    { label: 'Servicios', shortLabel: 'Servicios', path: '/dashboard/services' },
    { label: 'Disponibilidad', shortLabel: 'Agenda', path: '/dashboard/availability' },
    { label: 'Reseñas', shortLabel: 'Reseñas', path: '/dashboard/reviews' },
    { label: 'Mis reservas', shortLabel: 'Mias', path: '/my-bookings' },
    { label: 'Mis pagos', shortLabel: 'Pagos', path: '/my-payments' },
    { label: 'Reservas profesionales', shortLabel: 'Reservas', path: '/professional/bookings' },
    { label: 'Pagos recibidos', shortLabel: 'Recibidos', path: '/professional/payments' },
    { label: 'Marketplace', shortLabel: 'Market', path: '/services' },
  ];

  ngOnInit(): void {
    if (this.authStore.currentUser()) return;

    this.authStore
      .loadCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => undefined,
      });
  }

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
