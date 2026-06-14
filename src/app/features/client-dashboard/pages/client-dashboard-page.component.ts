import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthStore } from '../../../core/auth/services/auth.store';
import { hasProfessionalAccess } from '../../../core/auth/utils/auth-capabilities';
import { AppBadgeComponent } from '../../../shared/ui/badge/badge.component';
import { AppCardComponent } from '../../../shared/ui/card/card.component';
import { AppPageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';

type ClientDashboardAction = {
  readonly title: string;
  readonly description: string;
  readonly route: string;
  readonly eyebrow: string;
  readonly icon: string;
  readonly iconClass: string;
};

type ClientDashboardSummaryCard = {
  readonly label: string;
  readonly value: string;
  readonly description: string;
  readonly route: string;
  readonly icon: string;
  readonly iconClass: string;
};

@Component({
  selector: 'app-client-dashboard-page',
  imports: [
    RouterLink,
    AppBadgeComponent,
    AppCardComponent,
    AppPageHeaderComponent,
  ],
  templateUrl: './client-dashboard-page.component.html',
  styleUrl: './client-dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDashboardPageComponent {
  private readonly authStore = inject(AuthStore);

  readonly currentUser = computed(() => this.authStore.currentUser());

  readonly userName = computed(() => {
    return this.currentUser()?.name?.trim() || 'cliente';
  });

  readonly canAccessProfessionalDashboard = computed(() => {
    const user = this.currentUser();

    return user ? hasProfessionalAccess(user) : false;
  });

  readonly professionalActionLabel = computed(() => {
    return this.canAccessProfessionalDashboard()
      ? 'Ir al panel profesional'
      : 'Activar perfil profesional';
  });

  readonly professionalActionRoute = computed(() => {
    return this.canAccessProfessionalDashboard()
      ? '/dashboard'
      : '/professional/onboarding';
  });

  readonly professionalActionDescription = computed(() => {
    return this.canAccessProfessionalDashboard()
      ? 'Gestioná tus servicios, reservas recibidas, disponibilidad y sesiones.'
      : 'Convertí tu cuenta en profesional para publicar servicios y recibir reservas.';
  });

  readonly summaryCards = computed<ClientDashboardSummaryCard[]>(() => [
    {
      label: 'Reservas',
      value: 'Mis turnos',
      description: 'Consultá próximas reservas, historial, cancelaciones y reprogramaciones.',
      route: '/my-bookings',
      icon: '↗',
      iconClass: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Pagos',
      value: 'Mis pagos',
      description: 'Revisá pagos realizados, pendientes o asociados a tus reservas.',
      route: '/my-payments',
      icon: '$',
      iconClass: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Paquetes',
      value: 'Mis paquetes',
      description: 'Controlá sesiones disponibles, utilizadas y paquetes contratados.',
      route: '/my-packages',
      icon: '#',
      iconClass: 'bg-violet-100 text-violet-700',
    },
    {
      label: 'Videollamadas',
      value: 'Mis sesiones',
      description: 'Ingresá a tus salas remotas o híbridas cuando estén disponibles.',
      route: '/video-sessions/my',
      icon: '▶',
      iconClass: 'bg-indigo-100 text-indigo-700',
    },
  ]);

  readonly primaryActions = computed<ClientDashboardAction[]>(() => [
    {
      eyebrow: 'Explorar',
      title: 'Buscar servicios',
      description: 'Encontrá profesionales, compará servicios y reservá según disponibilidad.',
      route: '/services',
      icon: '⌕',
      iconClass: 'bg-blue-100 text-blue-700',
    },
    {
      eyebrow: 'Agenda',
      title: 'Ver mis reservas',
      description: 'Accedé rápidamente a tus próximas reservas y su estado actual.',
      route: '/my-bookings',
      icon: '↗',
      iconClass: 'bg-indigo-100 text-indigo-700',
    },
    {
      eyebrow: 'Virtual',
      title: 'Entrar a sesiones',
      description: 'Revisá tus videollamadas próximas y accedé a la sala correspondiente.',
      route: '/video-sessions/my',
      icon: '▶',
      iconClass: 'bg-violet-100 text-violet-700',
    },
    {
      eyebrow: 'Cuenta',
      title: 'Configurar cuenta',
      description: 'Actualizá tus datos personales, seguridad y preferencias de cuenta.',
      route: '/account-settings',
      icon: '⚙',
      iconClass: 'bg-slate-100 text-slate-700',
    },
  ]);
}
