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
        path: 'my-bookings',
        title: 'Mis reservas | ProConnect',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            './features/bookings/pages/my-bookings-page/my-bookings-page.component'
          ).then((m) => m.MyBookingsPageComponent),
      },
      {
        path: 'my-bookings/:bookingId',
        title: 'Detalle de reserva | ProConnect',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            './features/bookings/pages/booking-detail-page/booking-detail-page.component'
          ).then((m) => m.BookingDetailPageComponent),
      },
      {
        path: 'my-payments',
        title: 'Mis pagos | ProConnect',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            './features/payments/pages/my-payments-page/my-payments-page.component'
          ).then((m) => m.MyPaymentsPageComponent),
      },
      {
        path: 'my-packages',
        title: 'Mis paquetes | ProConnect',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            './features/packages/pages/my-packages-page/my-packages-page.component'
          ).then((m) => m.MyPackagesPageComponent),
      },
      {
        path: 'client-packages/:clientPackageId',
        title: 'Detalle de paquete | ProConnect',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            './features/packages/pages/client-package-detail-page/client-package-detail-page.component'
          ).then((m) => m.ClientPackageDetailPageComponent),
      },
      {
        path: 'professional/bookings',
        title: 'Reservas profesionales | ProConnect',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            './features/bookings/pages/professional-bookings-page/professional-bookings-page.component'
          ).then((m) => m.ProfessionalBookingsPageComponent),
      },
      {
        path: 'professional/bookings/:bookingId',
        title: 'Detalle de reserva profesional | ProConnect',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            './features/bookings/pages/professional-booking-detail-page/professional-booking-detail-page.component'
          ).then((m) => m.ProfessionalBookingDetailPageComponent),
      },
      {
        path: 'professional/payments',
        title: 'Pagos recibidos | ProConnect',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            './features/payments/pages/professional-payments-page/professional-payments-page.component'
          ).then((m) => m.ProfessionalPaymentsPageComponent),
      },
      {
        path: 'professional/package-products',
        title: 'Paquetes profesionales | ProConnect',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            './features/packages/pages/professional-package-products-page/professional-package-products-page.component'
          ).then((m) => m.ProfessionalPackageProductsPageComponent),
      },
      {
        path: 'professional/package-products/:packageProductId',
        title: 'Detalle de paquete profesional | ProConnect',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            './features/packages/pages/professional-package-product-detail-page/professional-package-product-detail-page.component'
          ).then((m) => m.ProfessionalPackageProductDetailPageComponent),
      },
      {
        path: 'professional/client-packages',
        title: 'Paquetes vendidos | ProConnect',
        canActivate: [authGuard],
        loadComponent: () =>
          import(
            './features/packages/pages/professional-sold-packages-page/professional-sold-packages-page.component'
          ).then((m) => m.ProfessionalSoldPackagesPageComponent),
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
      {
        path: 'reviews',
        title: 'Reseñas | ProConnect',
        loadComponent: () =>
          import(
            './features/reviews/pages/professional-reviews-page/professional-reviews-page.component'
          ).then((m) => m.ProfessionalReviewsPageComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
