import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NotificationStore } from '../../notifications/services/notification-store';
import { AuthStore } from '../../auth/services/auth.store';
import { hasProfessionalAccess } from '../../auth/utils/auth-capabilities';
import { ToastComponent } from '../../../shared/components/notification-toast/notification-toast';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';

type NavigationItem = {
  label: string;
  path: string;
  shortLabel: string;
};

type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ToastComponent,
    NotificationBellComponent,
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayoutComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly notificationStore = inject(NotificationStore);

  readonly isMobileMenuOpen = signal(false);

  readonly currentUser = computed(() => this.authStore.currentUser());
  readonly userName = computed(() => this.currentUser()?.name ?? 'Tu cuenta');
  readonly isProfessional = computed(() => hasProfessionalAccess(this.currentUser()));

  readonly shouldShowProfessionalCta = computed(
    () => !!this.currentUser() && !this.isProfessional(),
  );

  readonly homePath = computed(() => (this.isProfessional() ? '/dashboard' : '/my-bookings'));

  readonly accountTypeLabel = computed(() =>
    this.isProfessional() ? 'Cuenta profesional' : 'Cuenta cliente',
  );

  readonly commonNavigation: NavigationItem[] = [
    { label: 'Marketplace', shortLabel: 'Market', path: '/services' },
    { label: 'Notificaciones', shortLabel: 'Notis', path: '/notifications' },
  ];

  readonly clientNavigation: NavigationItem[] = [
    { label: 'Panel cliente', shortLabel: 'Dashboard', path: '/client/dashboard' },
    {
      label: 'Mis reservas como cliente',
      shortLabel: 'Reservas',
      path: '/my-bookings',
    },
    { label: 'Mis pagos', shortLabel: 'Pagos', path: '/my-payments' },
    { label: 'Mis paquetes', shortLabel: 'Paquetes', path: '/my-packages' },
    { label: 'Mis sesiones', shortLabel: 'Sesiones', path: '/video-sessions/my' },
    { label: 'Ajustes de cuenta', shortLabel: 'Ajustes', path: '/account-settings' },
  ];

  readonly professionalNavigation: NavigationItem[] = [
    { label: 'Panel profesional', shortLabel: 'Panel', path: '/dashboard' },
    {
      label: 'Perfil profesional',
      shortLabel: 'Perfil',
      path: '/dashboard/profile',
    },
    { label: 'Servicios', shortLabel: 'Servicios', path: '/dashboard/services' },
    {
      label: 'Disponibilidad',
      shortLabel: 'Disp.',
      path: '/dashboard/availability',
    },
    {
      label: 'Politica de reservas',
      shortLabel: 'Config.',
      path: '/dashboard/settings/booking-policy',
    },
    { label: 'Reseñas', shortLabel: 'Reseñas', path: '/dashboard/reviews' },
    {
      label: 'Reservas recibidas',
      shortLabel: 'Recibidas',
      path: '/professional/bookings',
    },
    {
      label: 'Paquetes profesionales',
      shortLabel: 'Paquetes',
      path: '/professional/package-products',
    },
    {
      label: 'Paquetes vendidos',
      shortLabel: 'Vendidos',
      path: '/professional/client-packages',
    },
    {
      label: 'Pagos recibidos',
      shortLabel: 'Ingresos',
      path: '/professional/payments',
    },
    {
      label: 'Salas profesionales',
      shortLabel: 'Salas',
      path: '/professional/video-sessions',
    },
    {
      label: 'Agenda',
      shortLabel: 'Agenda',
      path: '/professional/agenda',
    }
  ];

  readonly visibleNavigationGroups = computed<NavigationGroup[]>(() => {
    const groups: NavigationGroup[] = [
      { title: 'Cuenta', items: this.commonNavigation },
      { title: 'Cliente', items: this.clientNavigation },
    ];

    if (this.isProfessional()) {
      groups.push({ title: 'Profesional', items: this.professionalNavigation });
    }

    return groups;
  });

  readonly visibleNavigationItems = computed(() =>
    this.visibleNavigationGroups().flatMap((group) => group.items),
  );



  openMobileMenu(): void {
    this.isMobileMenuOpen.set(true);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  logout(): void {
    this.closeMobileMenu();

    this.authStore
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigateByUrl('/login'),
        error: () => void this.router.navigateByUrl('/login'),
      });
  }
}
