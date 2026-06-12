import { Routes } from '@angular/router';

import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';
import { professionalGuard } from './core/auth/guards/professional.guard';

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
        path: 'auth/oauth/callback',
        title: 'Completando inicio de sesion | ProConnect',
        loadComponent: () =>
          import('./features/auth/pages/oauth-callback/oauth-callback').then(
            (m) => m.OAuthCallbackPage,
          ),
      },
      {
        path: 'services',
        title: 'Servicios | ProConnect',
        loadComponent: () =>
          import(
            './features/public-discovery/pages/public-services-page/public-services-page.component'
          ).then((m) => m.PublicServicesPageComponent),
      },
      {
        path: 'services/:id/availability',
        title: 'Disponibilidad publica | ProConnect',
        loadComponent: () =>
          import(
            './features/availability/pages/public-availability-page/public-availability-page.component'
          ).then((m) => m.PublicAvailabilityPageComponent),
      },
      {
        path: 'services/:serviceId',
        title: 'Detalle del servicio | ProConnect',
        loadComponent: () =>
          import(
            './features/public-discovery/pages/public-service-detail-page/public-service-detail-page.component'
          ).then((m) => m.PublicServiceDetailPageComponent),
      },
      {
        path: 'professionals/:professionalId',
        title: 'Perfil profesional | ProConnect',
        loadComponent: () =>
          import(
            './features/public-discovery/pages/public-professional-profile-page/public-professional-profile-page.component'
          ).then((m) => m.PublicProfessionalProfilePageComponent),
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
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    children: [
      {
        path: 'notifications',
        loadComponent: () =>
          import(
            './features/notifications/pages/notifications-page.components'
          ).then(m => m.NotificationsPageComponent),
      },
      {
        path: 'my-bookings',
        title: 'Mis reservas como cliente | ProConnect',
        loadComponent: () =>
          import(
            './features/bookings/pages/my-bookings-page/my-bookings-page.component'
          ).then((m) => m.MyBookingsPageComponent),
      },
      {
        path: 'my-bookings/:bookingId',
        title: 'Detalle de reserva | ProConnect',
        loadComponent: () =>
          import(
            './features/bookings/pages/booking-detail-page/booking-detail-page.component'
          ).then((m) => m.BookingDetailPageComponent),
      },
      {
        path: 'my-payments',
        title: 'Mis pagos | ProConnect',
        loadComponent: () =>
          import(
            './features/payments/pages/my-payments-page/my-payments-page.component'
          ).then((m) => m.MyPaymentsPageComponent),
      },
      {
        path: 'my-packages',
        title: 'Mis paquetes | ProConnect',
        loadComponent: () =>
          import(
            './features/packages/pages/my-packages-page/my-packages-page.component'
          ).then((m) => m.MyPackagesPageComponent),
      },
      {
        path: 'video-sessions/my',
        title: 'Mis sesiones | ProConnect',
        loadComponent: () =>
          import(
            './features/video-sessions/pages/my-video-sessions-page/my-video-sessions-page.component'
          ).then((m) => m.MyVideoSessionsPageComponent),
      },
      {
        path: 'video-sessions/:bookingId/join',
        title: 'Videollamada | ProConnect',
        loadComponent: () =>
          import(
            './features/video-sessions/pages/video-session-room-page/video-session-room-page.component'
          ).then((m) => m.VideoSessionRoomPageComponent),
      },
      {
        path: 'client-packages/:clientPackageId',
        title: 'Detalle de paquete | ProConnect',
        loadComponent: () =>
          import(
            './features/packages/pages/client-package-detail-page/client-package-detail-page.component'
          ).then((m) => m.ClientPackageDetailPageComponent),
      },
      {
        path: 'professional/onboarding/profile',
        title: 'Configurar perfil profesional | ProConnect',
        loadComponent: () =>
          import(
            './features/professional-profile/pages/professional-profile-page.component'
          ).then((m) => m.ProfessionalProfilePageComponent),
      },
      {
        path: 'professional/onboarding',
        title: 'Activar perfil profesional | ProConnect',
        loadComponent: () =>
          import(
            './features/professional-onboarding/pages/professional-onboarding-page.component'
          ).then((m) => m.ProfessionalOnboardingPageComponent),
      },
      {
        path: 'professional/bookings',
        title: 'Reservas recibidas | ProConnect',
        canActivate: [professionalGuard],
        loadComponent: () =>
          import(
            './features/bookings/pages/professional-bookings-page/professional-bookings-page.component'
          ).then((m) => m.ProfessionalBookingsPageComponent),
      },
      {
        path: 'professional/bookings/:bookingId',
        title: 'Detalle de reserva profesional | ProConnect',
        canActivate: [professionalGuard],
        loadComponent: () =>
          import(
            './features/bookings/pages/professional-booking-detail-page/professional-booking-detail-page.component'
          ).then((m) => m.ProfessionalBookingDetailPageComponent),
      },
      {
        path: 'professional/video-sessions',
        title: 'Salas profesionales | ProConnect',
        canActivate: [professionalGuard],
        loadComponent: () =>
          import(
            './features/video-sessions/pages/professional-video-sessions-page/professional-video-sessions-page.component'
          ).then((m) => m.ProfessionalVideoSessionsPageComponent),
      },
      {
        path: 'professional/payments',
        title: 'Pagos recibidos | ProConnect',
        canActivate: [professionalGuard],
        loadComponent: () =>
          import(
            './features/payments/pages/professional-payments-page/professional-payments-page.component'
          ).then((m) => m.ProfessionalPaymentsPageComponent),
      },
      {
        path: 'professional/package-products',
        title: 'Paquetes profesionales | ProConnect',
        canActivate: [professionalGuard],
        loadComponent: () =>
          import(
            './features/packages/pages/professional-package-products-page/professional-package-products-page.component'
          ).then((m) => m.ProfessionalPackageProductsPageComponent),
      },
      {
        path: 'professional/package-products/:packageProductId',
        title: 'Detalle de paquete profesional | ProConnect',
        canActivate: [professionalGuard],
        loadComponent: () =>
          import(
            './features/packages/pages/professional-package-product-detail-page/professional-package-product-detail-page.component'
          ).then((m) => m.ProfessionalPackageProductDetailPageComponent),
      },
      {
        path: 'professional/client-packages',
        title: 'Paquetes vendidos | ProConnect',
        canActivate: [professionalGuard],
        loadComponent: () =>
          import(
            './features/packages/pages/professional-sold-packages-page/professional-sold-packages-page.component'
          ).then((m) => m.ProfessionalSoldPackagesPageComponent),
      },
      {
        path: 'dashboard',
        canActivate: [professionalGuard],
        children: [
          {
            path: '',
            title: 'Panel profesional | ProConnect',
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
                title: 'Servicios profesionales | ProConnect',
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
            title: 'Disponibilidad profesional | ProConnect',
            loadComponent: () =>
              import(
                './features/availability/pages/availability-manager-page/availability-manager-page.component'
              ).then((m) => m.AvailabilityManagerPageComponent),
          },
          {
            path: 'reviews',
            title: 'Reseñas profesionales | ProConnect',
            loadComponent: () =>
              import(
                './features/reviews/pages/professional-reviews-page/professional-reviews-page.component'
              ).then((m) => m.ProfessionalReviewsPageComponent),
          },
          {
            path: 'settings/booking-policy',
            title: 'Politica de reservas | ProConnect',
            loadComponent: () =>
              import(
                './features/professional-settings/booking-policies/pages/booking-policy-settings-page/booking-policy-settings-page.component'
              ).then((m) => m.BookingPolicySettingsPageComponent),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
