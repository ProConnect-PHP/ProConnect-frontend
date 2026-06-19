import { Routes } from '@angular/router';

import { adminGuard } from './core/auth/guards/admin.guard';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/public-layout/public-layout.component').then(
        (m) => m.PublicLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/layout/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    loadChildren: () =>
      import('./features/authenticated/authenticated.routes').then(
        (m) => m.AUTHENTICATED_ROUTES,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
// import { Routes } from '@angular/router';

// import { authGuard } from './core/auth/guards/auth.guard';
// import { adminGuard } from './core/auth/guards/admin.guard';
// import { guestGuard } from './core/auth/guards/guest.guard';
// import { professionalGuard } from './core/auth/guards/professional.guard';
// import { emailVerifiedGuard } from './core/auth/guards/email-verified.guard';

// export const routes: Routes = [
//   {
//     path: 'admin',
//     canActivate: [authGuard, adminGuard],
//     loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
//   },
//   {
//     path: '',
//     loadComponent: () =>
//       import('./core/layout/public-layout/public-layout.component').then(
//         (m) => m.PublicLayoutComponent,
//       ),
//     children: [
//       {
//         path: '',
//         title: 'ProConnect | Reservas profesionales simples',
//         loadComponent: () =>
//           import('./features/landing/pages/landing-page.component').then(
//             (m) => m.LandingPageComponent,
//           ),
//       },
//       {
//         path: 'auth/oauth/callback',
//         title: 'Completando inicio de sesion | ProConnect',
//         loadComponent: () =>
//           import('./features/auth/pages/oauth-callback/oauth-callback').then(
//             (m) => m.OAuthCallbackPage,
//           ),
//       },
//       {
//         path: 'services',
//         title: 'Servicios | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/public-discovery/pages/public-services-page/public-services-page.component'
//           ).then((m) => m.PublicServicesPageComponent),
//       },
//       {
//         path: 'services/:id/availability',
//         title: 'Disponibilidad publica | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/availability/pages/public-availability-page/public-availability-page.component'
//           ).then((m) => m.PublicAvailabilityPageComponent),
//       },
//       {
//         path: 'services/:serviceId',
//         title: 'Detalle del servicio | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/public-discovery/pages/public-service-detail-page/public-service-detail-page.component'
//           ).then((m) => m.PublicServiceDetailPageComponent),
//       },
//       {
//         path: 'professionals/:professionalId',
//         title: 'Perfil profesional | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/public-discovery/pages/public-professional-profile-page/public-professional-profile-page.component'
//           ).then((m) => m.PublicProfessionalProfilePageComponent),
//       },
//       {
//         path: 'login',
//         title: 'Iniciar sesion | ProConnect',
//         canActivate: [guestGuard],
//         loadComponent: () =>
//           import('./features/auth/pages/login-page/login-page.component').then(
//             (m) => m.LoginPageComponent,
//           ),
//       },
//       {
//         path: 'forgot-password',
//         title: 'Olvidé mi contraseña | ProConnect',
//         canActivate: [guestGuard],
//         loadComponent: () =>
//           import('./features/auth/pages/forgot-password/forgot-password.page').then(
//             (m) => m.ForgotPasswordPage,
//           ),
//       },
//       {
//         path: 'register',
//         title: 'Crear cuenta | ProConnect',
//         canActivate: [guestGuard],
//         loadComponent: () =>
//           import('./features/auth/pages/register-page/register-page.component').then(
//             (m) => m.RegisterPageComponent,
//           ),
//       },
//       {
//         path: 'reset-password/:token',
//         title: 'Restablecer contraseña | ProConnect',
//         loadComponent: () =>
//           import('./features/auth/reset-password/reset-password.page').then(
//             (m) => m.ResetPasswordPage,
//           ),
//       },
//       {
//         path: 'reset-password',
//         title: 'Restablecer contraseña | ProConnect',
//         loadComponent: () =>
//           import('./features/auth/reset-password/reset-password.page').then(
//             (m) => m.ResetPasswordPage,
//           ),
//       },
//       {
//         path: 'auth/email-verification-required',
//         title: 'Verificar correo | ProConnect',
//         canActivate: [authGuard],
//         loadComponent: () =>
//           import(
//             './features/auth/pages/email-verification-required/email-verification-required.page'
//           ).then((m) => m.EmailVerificationRequiredPage),
//       },
//       {
//         path: 'auth/verify-email',
//         title: 'Verificando correo | ProConnect',
//         loadComponent: () =>
//           import('./features/auth/pages/verify-email/verify-email.page').then(
//             (m) => m.VerifyEmailPage,
//           ),
//       },
//     ],
//   },
//   {
//     path: '',
//     canActivate: [authGuard],
//     loadComponent: () =>
//       import('./core/layout/dashboard-layout/dashboard-layout.component').then(
//         (m) => m.DashboardLayoutComponent,
//       ),
//     children: [
//       {
//         path: 'account-settings',
//         loadComponent: () => import('./features/account-settings/pages/account-settings-page/account-settings-page.component')
//           .then(m => m.AccountSettingsPageComponent)
//       },
//       {
//         path: 'notifications',
//         title: 'Notificaciones | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/notifications/pages/notifications-page.components'
//           ).then((m) => m.NotificationsPageComponent),
//       },
//       {
//         path: 'client/dashboard',
//         title: 'Panel cliente | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/client-dashboard/pages/client-dashboard-page.component'
//           ).then((m) => m.ClientDashboardPageComponent),
//       },
//       {
//         path: 'my-bookings',
//         title: 'Mis reservas como cliente | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/bookings/pages/my-bookings-page/my-bookings-page.component'
//           ).then((m) => m.MyBookingsPageComponent),
//       },
//       {
//         path: 'my-bookings/:bookingId',
//         title: 'Detalle de reserva | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/bookings/pages/booking-detail-page/booking-detail-page.component'
//           ).then((m) => m.BookingDetailPageComponent),
//       },
//       {
//         path: 'my-payments',
//         title: 'Mis pagos | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/payments/pages/my-payments-page/my-payments-page.component'
//           ).then((m) => m.MyPaymentsPageComponent),
//       },
//       {
//         path: 'payments/result',
//         title: 'Resultado del pago | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/payments/pages/payment-result-page/payment-result-page.component'
//           ).then((m) => m.PaymentResultPageComponent),
//       },
//       {
//         path: 'payments/success',
//         title: 'Resultado del pago | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/payments/pages/payment-result-page/payment-result-page.component'
//           ).then((m) => m.PaymentResultPageComponent),
//       },
//       {
//         path: 'payments/failure',
//         title: 'Resultado del pago | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/payments/pages/payment-result-page/payment-result-page.component'
//           ).then((m) => m.PaymentResultPageComponent),
//       },
//       {
//         path: 'payments/pending',
//         title: 'Resultado del pago | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/payments/pages/payment-result-page/payment-result-page.component'
//           ).then((m) => m.PaymentResultPageComponent),
//       },
//       {
//         path: 'payments/cancel',
//         title: 'Resultado del pago | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/payments/pages/payment-result-page/payment-result-page.component'
//           ).then((m) => m.PaymentResultPageComponent),
//       },
//       {
//         path: 'my-packages',
//         title: 'Mis paquetes | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/packages/pages/my-packages-page/my-packages-page.component'
//           ).then((m) => m.MyPackagesPageComponent),
//       },
//       {
//         path: 'video-sessions/my',
//         title: 'Mis sesiones | ProConnect',
//         canActivate: [emailVerifiedGuard],
//         loadComponent: () =>
//           import(
//             './features/video-sessions/pages/my-video-sessions-page/my-video-sessions-page.component'
//           ).then((m) => m.MyVideoSessionsPageComponent),
//       },
//       {
//         path: 'video-sessions/:bookingId/join',
//         canActivate: [emailVerifiedGuard],
//         title: 'Videollamada | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/video-sessions/pages/video-session-room-page/video-session-room-page.component'
//           ).then((m) => m.VideoSessionRoomPageComponent),
//       },
//       {
//         path: 'client-packages/:clientPackageId',
//         title: 'Detalle de paquete | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/packages/pages/client-package-detail-page/client-package-detail-page.component'
//           ).then((m) => m.ClientPackageDetailPageComponent),
//       },
//       {
//         path: 'professional/onboarding/profile',
//         title: 'Configurar perfil profesional | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/professional-profile/pages/professional-profile-page.component'
//           ).then((m) => m.ProfessionalProfilePageComponent),
//       },
//       {
//         path: 'professional/onboarding',
//         title: 'Activar perfil profesional | ProConnect',
//         loadComponent: () =>
//           import(
//             './features/professional-onboarding/pages/professional-onboarding-page.component'
//           ).then((m) => m.ProfessionalOnboardingPageComponent),
//       },
//       {
//         path: 'professional/bookings',
//         title: 'Reservas recibidas | ProConnect',
//         canActivate: [professionalGuard],
//         loadComponent: () =>
//           import(
//             './features/bookings/pages/professional-bookings-page/professional-bookings-page.component'
//           ).then((m) => m.ProfessionalBookingsPageComponent),
//       },
//       {
//         path: 'professional/bookings/:bookingId',
//         title: 'Detalle de reserva profesional | ProConnect',
//         canActivate: [professionalGuard],
//         loadComponent: () =>
//           import(
//             './features/bookings/pages/professional-booking-detail-page/professional-booking-detail-page.component'
//           ).then((m) => m.ProfessionalBookingDetailPageComponent),
//       },
//       {
//         path: 'professional/video-sessions',
//         title: 'Salas profesionales | ProConnect',
//         canActivate: [professionalGuard, emailVerifiedGuard],
//         loadComponent: () =>
//           import(
//             './features/video-sessions/pages/professional-video-sessions-page/professional-video-sessions-page.component'
//           ).then((m) => m.ProfessionalVideoSessionsPageComponent),
//       },
//       {
//         path: 'professional/payments',
//         title: 'Pagos recibidos | ProConnect',
//         canActivate: [professionalGuard],
//         loadComponent: () =>
//           import(
//             './features/payments/pages/professional-payments-page/professional-payments-page.component'
//           ).then((m) => m.ProfessionalPaymentsPageComponent),
//       },
//       {
//         path: 'professional/package-products',
//         title: 'Paquetes profesionales | ProConnect',
//         canActivate: [professionalGuard],
//         loadComponent: () =>
//           import(
//             './features/packages/pages/professional-package-products-page/professional-package-products-page.component'
//           ).then((m) => m.ProfessionalPackageProductsPageComponent),
//       },
//       {
//         path: 'professional/package-products/:packageProductId',
//         title: 'Detalle de paquete profesional | ProConnect',
//         canActivate: [professionalGuard],
//         loadComponent: () =>
//           import(
//             './features/packages/pages/professional-package-product-detail-page/professional-package-product-detail-page.component'
//           ).then((m) => m.ProfessionalPackageProductDetailPageComponent),
//       },
//       {
//         path: 'professional/client-packages',
//         title: 'Paquetes vendidos | ProConnect',
//         canActivate: [professionalGuard],
//         loadComponent: () =>
//           import(
//             './features/packages/pages/professional-sold-packages-page/professional-sold-packages-page.component'
//           ).then((m) => m.ProfessionalSoldPackagesPageComponent),
//       },
//       {
//         path: 'professional/agenda',
//         loadComponent: () =>
//           import('./features/agenda/pages/professional-agenda-page/professional-agenda-page')
//             .then((m) => m.ProfessionalAgendaPage),
//       },
//       {
//         path: 'dashboard',
//         canActivate: [professionalGuard],
//         children: [
//           {
//             path: '',
//             title: 'Panel profesional | ProConnect',
//             loadComponent: () =>
//               import('./features/dashboard/pages/dashboard-page.component').then(
//                 (m) => m.DashboardPageComponent,
//               ),
//           },
//           {
//             path: 'profile',
//             title: 'Perfil profesional | ProConnect',
//             loadComponent: () =>
//               import(
//                 './features/professional-profile/pages/professional-profile-page.component'
//               ).then((m) => m.ProfessionalProfilePageComponent),
//           },
//           {
//             path: 'services',
//             children: [
//               {
//                 path: '',
//                 title: 'Servicios profesionales | ProConnect',
//                 loadComponent: () =>
//                   import('./features/services/pages/list/services-list-page.component').then(
//                     (m) => m.ServicesListPageComponent,
//                   ),
//               },
//               {
//                 path: 'new',
//                 title: 'Nuevo servicio | ProConnect',
//                 loadComponent: () =>
//                   import('./features/services/pages/create/service-create-page.component').then(
//                     (m) => m.ServiceCreatePageComponent,
//                   ),
//               },
//               {
//                 path: ':id',
//                 title: 'Editar servicio | ProConnect',
//                 loadComponent: () =>
//                   import('./features/services/pages/edit/service-edit-page.component').then(
//                     (m) => m.ServiceEditPageComponent,
//                   ),
//               },
//             ],
//           },
//           {
//             path: 'availability',
//             title: 'Disponibilidad profesional | ProConnect',
//             loadComponent: () =>
//               import(
//                 './features/availability/pages/availability-manager-page/availability-manager-page.component'
//               ).then((m) => m.AvailabilityManagerPageComponent),
//           },
//           {
//             path: 'reviews',
//             title: 'Reseñas profesionales | ProConnect',
//             loadComponent: () =>
//               import(
//                 './features/reviews/pages/professional-reviews-page/professional-reviews-page.component'
//               ).then((m) => m.ProfessionalReviewsPageComponent),
//           },
//           {
//             path: 'settings/booking-policy',
//             title: 'Politica de reservas | ProConnect',
//             loadComponent: () =>
//               import(
//                 './features/professional-settings/booking-policies/pages/booking-policy-settings-page/booking-policy-settings-page.component'
//               ).then((m) => m.BookingPolicySettingsPageComponent),
//           },
//         ],
//       }
//     ],
//   },
//   {
//     path: '**',
//     redirectTo: '',
//   },
// ];
