import { Routes } from '@angular/router';

import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/public-layout/public-layout.component').then(
        (m) => m.PublicLayoutComponent,
      ),
    children: [
      {
        path: '',
        title: 'ProConnect | Reservas profesionales simples',
        loadComponent: () =>
          import('./features/landing/pages/landing-page.component').then(
            (m) => m.LandingPageComponent,
          ),
      },
      {
        path: 'login',
        title: 'Iniciar sesion | ProConnect',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/pages/login-page/login-page.component').then(
            (m) => m.LoginPageComponent,
          ),
      },
      {
        path: 'register',
        title: 'Crear cuenta | ProConnect',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/pages/register-page/register-page.component').then(
            (m) => m.RegisterPageComponent,
          ),
      },
      {
        path: 'services/:id/availability',
        title: 'Disponibilidad publica | ProConnect',
        loadComponent: () =>
          import(
            './features/availability/pages/public-availability-page/public-availability-page.component'
          ).then((m) => m.PublicAvailabilityPageComponent),
      },
    ],
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    children: [
      {
        path: '',
        title: 'Dashboard | ProConnect',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page.component').then(
            (m) => m.DashboardPageComponent,
          ),
      },
      {
        path: 'profile',
        title: 'Perfil profesional | ProConnect',
        loadComponent: () =>
          import(
            './features/professional-profile/pages/professional-profile-page.component'
          ).then((m) => m.ProfessionalProfilePageComponent),
      },
      {
        path: 'services',
        children: [
          {
            path: '',
            title: 'Servicios | ProConnect',
            loadComponent: () =>
              import('./features/services/pages/services-list-page.component').then(
                (m) => m.ServicesListPageComponent,
              ),
          },
          {
            path: 'new',
            title: 'Nuevo servicio | ProConnect',
            loadComponent: () =>
              import('./features/services/pages/service-create-page.component').then(
                (m) => m.ServiceCreatePageComponent,
              ),
          },
          {
            path: ':id',
            title: 'Editar servicio | ProConnect',
            loadComponent: () =>
              import('./features/services/pages/service-edit-page.component').then(
                (m) => m.ServiceEditPageComponent,
              ),
          },
        ],
      },
      {
        path: 'availability',
        title: 'Disponibilidad | ProConnect',
        loadComponent: () =>
          import(
            './features/availability/pages/availability-manager-page/availability-manager-page.component'
          ).then((m) => m.AvailabilityManagerPageComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
