import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NotificationStore } from '../../notifications/services/notification-store';
import { AuthStore } from '../../auth/services/auth.store';
import { hasProfessionalAccess } from '../../auth/utils/auth-capabilities';
import { ToastComponent } from '../../../shared/components/notification-toast/notification-toast';

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
  imports: [RouterLink, RouterLinkActive, RouterOutlet, ToastComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayoutComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly notificationStore = inject(NotificationStore);

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
  ];

  readonly clientNavigation: NavigationItem[] = [
    {
      label: 'Mis reservas como cliente',
      shortLabel: 'Reservas',
      path: '/my-bookings',
    },
    { label: 'Mis pagos', shortLabel: 'Pagos', path: '/my-payments' },
    { label: 'Mis paquetes', shortLabel: 'Paquetes', path: '/my-packages' },
    { label: 'Mis sesiones', shortLabel: 'Sesiones', path: '/video-sessions/my' },
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
      shortLabel: 'Agenda',
      path: '/dashboard/availability',
    },
    {
      label: 'Politica de reservas',
      shortLabel: 'Config.',
      path: '/dashboard/settings/booking-policy',
    },
    { label: 'Resenas', shortLabel: 'Resenas', path: '/dashboard/reviews' },
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

  onNotificationsClick(): void {
    this.notificationStore.markAllRead();
    // próximamente: abrir panel/dropdown
  }
}
