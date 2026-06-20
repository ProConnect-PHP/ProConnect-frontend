import { Routes } from '@angular/router';

import { emailVerifiedGuard } from '../../core/auth/guards/email-verified.guard';
import { professionalGuard } from '../../core/auth/guards/professional.guard';

const ACCOUNT_ROUTES: Routes = [
  {
    path: 'account-settings',
    title: 'Ajustes de cuenta | ProConnect',
    loadComponent: () =>
      import(
        '../account-settings/pages/account-settings-page/account-settings-page.component'
      ).then((m) => m.AccountSettingsPageComponent),
  },
  {
    path: 'notifications',
    title: 'Notificaciones | ProConnect',
    loadComponent: () =>
      import('../notifications/pages/notifications-page.components').then(
        (m) => m.NotificationsPageComponent,
      ),
  },
];

const CLIENT_READ_ROUTES: Routes = [
  {
    path: 'client/dashboard',
    title: 'Panel cliente | ProConnect',
    loadComponent: () =>
      import('../client-dashboard/pages/client-dashboard-page.component').then(
        (m) => m.ClientDashboardPageComponent,
      ),
  },
  {
    path: 'my-bookings',
    title: 'Mis reservas como cliente | ProConnect',
    loadComponent: () =>
      import('../bookings/pages/my-bookings-page/my-bookings-page.component').then(
        (m) => m.MyBookingsPageComponent,
      ),
  },
  {
    path: 'my-bookings/:bookingId',
    title: 'Detalle de reserva | ProConnect',
    loadComponent: () =>
      import(
        '../bookings/pages/booking-detail-page/booking-detail-page.component'
      ).then((m) => m.BookingDetailPageComponent),
  },
  {
    path: 'my-payments',
    title: 'Mis pagos | ProConnect',
    loadComponent: () =>
      import('../payments/pages/my-payments-page/my-payments-page.component').then(
        (m) => m.MyPaymentsPageComponent,
      ),
  },
  {
    path: 'my-payments/:paymentId',
    title: 'Detalle de pago | ProConnect',
    loadComponent: () =>
      import('../payments/pages/payment-detail-page/payment-detail-page.component').then(
        (m) => m.PaymentDetailPageComponent,
      ),
  },
  {
    path: 'my-packages',
    title: 'Mis paquetes | ProConnect',
    loadComponent: () =>
      import('../packages/pages/my-packages-page/my-packages-page.component').then(
        (m) => m.MyPackagesPageComponent,
      ),
  },
  {
    path: 'client-packages/:clientPackageId',
    title: 'Detalle de paquete | ProConnect',
    loadComponent: () =>
      import(
        '../packages/pages/client-package-detail-page/client-package-detail-page.component'
      ).then((m) => m.ClientPackageDetailPageComponent),
  },
  {
    path: 'video-sessions/my',
    title: 'Mis sesiones | ProConnect',
    loadComponent: () =>
      import(
        '../video-sessions/pages/my-video-sessions-page/my-video-sessions-page.component'
      ).then((m) => m.MyVideoSessionsPageComponent),
  },
];

const CLIENT_ACTION_ROUTES: Routes = [
  {
    path: 'video-sessions/:bookingId/join',
    title: 'Videollamada | ProConnect',
    canActivate: [emailVerifiedGuard],
    loadComponent: () =>
      import(
        '../video-sessions/pages/video-session-room-page/video-session-room-page.component'
      ).then((m) => m.VideoSessionRoomPageComponent),
  },

  /**
   * Futuras rutas explícitas de acción.
   *
   * Cuando existan estas pantallas, deben vivir acá:
   *
   * - crear reserva
   * - reprogramar reserva
   * - comprar paquete
   * - checkout
   * - crear reseña
   */
];

const PAYMENT_RESULT_ROUTES: Routes = [
  {
    path: 'payments/result',
    title: 'Resultado del pago | ProConnect',
    loadComponent: () =>
      import(
        '../payments/pages/payment-result-page/payment-result-page.component'
      ).then((m) => m.PaymentResultPageComponent),
  },
  {
    path: 'payments/success',
    title: 'Resultado del pago | ProConnect',
    loadComponent: () =>
      import(
        '../payments/pages/payment-result-page/payment-result-page.component'
      ).then((m) => m.PaymentResultPageComponent),
  },
  {
    path: 'payments/failure',
    title: 'Resultado del pago | ProConnect',
    loadComponent: () =>
      import(
        '../payments/pages/payment-result-page/payment-result-page.component'
      ).then((m) => m.PaymentResultPageComponent),
  },
  {
    path: 'payments/pending',
    title: 'Resultado del pago | ProConnect',
    loadComponent: () =>
      import(
        '../payments/pages/payment-result-page/payment-result-page.component'
      ).then((m) => m.PaymentResultPageComponent),
  },
  {
    path: 'payments/cancel',
    title: 'Resultado del pago | ProConnect',
    loadComponent: () =>
      import(
        '../payments/pages/payment-result-page/payment-result-page.component'
      ).then((m) => m.PaymentResultPageComponent),
  },
];

const PROFESSIONAL_ONBOARDING_ROUTES: Routes = [
  {
    path: 'professional/onboarding',
    title: 'Activar perfil profesional | ProConnect',
    canActivate: [emailVerifiedGuard],
    loadComponent: () =>
      import(
        '../professional-onboarding/pages/professional-onboarding-page.component'
      ).then((m) => m.ProfessionalOnboardingPageComponent),
  },
  {
    path: 'professional/onboarding/profile',
    title: 'Configurar perfil profesional | ProConnect',
    canActivate: [emailVerifiedGuard],
    loadComponent: () =>
      import(
        '../professional-profile/pages/professional-profile-page.component'
      ).then((m) => m.ProfessionalProfilePageComponent),
  },
];

const PROFESSIONAL_READ_ROUTES: Routes = [
  {
    path: 'professional/bookings',
    title: 'Reservas recibidas | ProConnect',
    canActivate: [professionalGuard],
    loadComponent: () =>
      import(
        '../bookings/pages/professional-bookings-page/professional-bookings-page.component'
      ).then((m) => m.ProfessionalBookingsPageComponent),
  },
  {
    path: 'professional/bookings/:bookingId',
    title: 'Detalle de reserva profesional | ProConnect',
    canActivate: [professionalGuard],
    loadComponent: () =>
      import(
        '../bookings/pages/professional-booking-detail-page/professional-booking-detail-page.component'
      ).then((m) => m.ProfessionalBookingDetailPageComponent),
  },
  {
    path: 'professional/video-sessions',
    title: 'Salas profesionales | ProConnect',
    canActivate: [professionalGuard],
    loadComponent: () =>
      import(
        '../video-sessions/pages/professional-video-sessions-page/professional-video-sessions-page.component'
      ).then((m) => m.ProfessionalVideoSessionsPageComponent),
  },
  {
    path: 'professional/payments',
    title: 'Pagos recibidos | ProConnect',
    canActivate: [professionalGuard],
    loadComponent: () =>
      import(
        '../payments/pages/professional-payments-page/professional-payments-page.component'
      ).then((m) => m.ProfessionalPaymentsPageComponent),
  },
  {
    path: 'professional/package-products',
    title: 'Paquetes profesionales | ProConnect',
    canActivate: [professionalGuard],
    loadComponent: () =>
      import(
        '../packages/pages/professional-package-products-page/professional-package-products-page.component'
      ).then((m) => m.ProfessionalPackageProductsPageComponent),
  },
  {
    path: 'professional/client-packages',
    title: 'Paquetes vendidos | ProConnect',
    canActivate: [professionalGuard],
    loadComponent: () =>
      import(
        '../packages/pages/professional-sold-packages-page/professional-sold-packages-page.component'
      ).then((m) => m.ProfessionalSoldPackagesPageComponent),
  },
  {
    path: 'professional/agenda',
    title: 'Agenda profesional | ProConnect',
    canActivate: [professionalGuard],
    loadComponent: () =>
      import('../agenda/pages/professional-agenda-page/professional-agenda-page').then(
        (m) => m.ProfessionalAgendaPage,
      ),
  },
];

const PROFESSIONAL_MUTATION_ROUTES: Routes = [
  {
    path: 'professional/package-products/:packageProductId',
    title: 'Detalle de paquete profesional | ProConnect',
    canActivate: [professionalGuard, emailVerifiedGuard],
    loadComponent: () =>
      import(
        '../packages/pages/professional-package-product-detail-page/professional-package-product-detail-page.component'
      ).then((m) => m.ProfessionalPackageProductDetailPageComponent),
  },
];

const PROFESSIONAL_DASHBOARD_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [professionalGuard],
    children: [
      {
        path: '',
        title: 'Panel profesional | ProConnect',
        loadComponent: () =>
          import('../dashboard/pages/dashboard-page.component').then(
            (m) => m.DashboardPageComponent,
          ),
      },
      {
        path: 'profile',
        title: 'Perfil profesional | ProConnect',
        canActivate: [emailVerifiedGuard],
        loadComponent: () =>
          import(
            '../professional-profile/pages/professional-profile-page.component'
          ).then((m) => m.ProfessionalProfilePageComponent),
      },
      {
        path: 'services',
        children: [
          {
            path: '',
            title: 'Servicios profesionales | ProConnect',
            loadComponent: () =>
              import('../services/pages/list/services-list-page.component').then(
                (m) => m.ServicesListPageComponent,
              ),
          },
          {
            path: 'new',
            title: 'Nuevo servicio | ProConnect',
            canActivate: [emailVerifiedGuard],
            loadComponent: () =>
              import('../services/pages/create/service-create-page.component').then(
                (m) => m.ServiceCreatePageComponent,
              ),
          },
          {
            path: ':id',
            title: 'Editar servicio | ProConnect',
            canActivate: [emailVerifiedGuard],
            loadComponent: () =>
              import('../services/pages/edit/service-edit-page.component').then(
                (m) => m.ServiceEditPageComponent,
              ),
          },
        ],
      },
      {
        path: 'availability',
        title: 'Disponibilidad profesional | ProConnect',
        canActivate: [emailVerifiedGuard],
        loadComponent: () =>
          import(
            '../availability/pages/availability-manager-page/availability-manager-page.component'
          ).then((m) => m.AvailabilityManagerPageComponent),
      },
      {
        path: 'reviews',
        title: 'Reseñas profesionales | ProConnect',
        loadComponent: () =>
          import(
            '../reviews/pages/professional-reviews-page/professional-reviews-page.component'
          ).then((m) => m.ProfessionalReviewsPageComponent),
      },
      {
        path: 'settings/booking-policy',
        title: 'Politica de reservas | ProConnect',
        canActivate: [emailVerifiedGuard],
        loadComponent: () =>
          import(
            '../professional-settings/booking-policies/pages/booking-policy-settings-page/booking-policy-settings-page.component'
          ).then((m) => m.BookingPolicySettingsPageComponent),
      },
    ],
  },
];

export const AUTHENTICATED_ROUTES: Routes = [
  ...ACCOUNT_ROUTES,
  ...CLIENT_READ_ROUTES,
  ...CLIENT_ACTION_ROUTES,
  ...PAYMENT_RESULT_ROUTES,
  ...PROFESSIONAL_ONBOARDING_ROUTES,
  ...PROFESSIONAL_READ_ROUTES,
  ...PROFESSIONAL_MUTATION_ROUTES,
  ...PROFESSIONAL_DASHBOARD_ROUTES,
];
