import { Routes } from '@angular/router';

import { authGuard } from '../../core/auth/guards/auth.guard';
import { guestGuard } from '../../core/auth/guards/guest.guard';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    title: 'ProConnect | Reservas profesionales simples',
    loadComponent: () =>
      import('../landing/pages/landing-page.component').then(
        (m) => m.LandingPageComponent,
      ),
  },
  {
    path: 'services',
    title: 'Servicios | ProConnect',
    loadComponent: () =>
      import(
        '../public-discovery/pages/public-services-page/public-services-page.component'
      ).then((m) => m.PublicServicesPageComponent),
  },
  {
    path: 'services/:id/availability',
    title: 'Disponibilidad publica | ProConnect',
    loadComponent: () =>
      import(
        '../availability/pages/public-availability-page/public-availability-page.component'
      ).then((m) => m.PublicAvailabilityPageComponent),
  },
  {
    path: 'services/:serviceId',
    title: 'Detalle del servicio | ProConnect',
    loadComponent: () =>
      import(
        '../public-discovery/pages/public-service-detail-page/public-service-detail-page.component'
      ).then((m) => m.PublicServiceDetailPageComponent),
  },
  {
    path: 'professionals/:professionalId',
    title: 'Perfil profesional | ProConnect',
    loadComponent: () =>
      import(
        '../public-discovery/pages/public-professional-profile-page/public-professional-profile-page.component'
      ).then((m) => m.PublicProfessionalProfilePageComponent),
  },

  /**
   * Auth pública / sesión
   */
  {
    path: 'login',
    title: 'Iniciar sesion | ProConnect',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('../auth/pages/login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  },
  {
    path: 'register',
    title: 'Crear cuenta | ProConnect',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('../auth/pages/register-page/register-page.component').then(
        (m) => m.RegisterPageComponent,
      ),
  },
  {
    path: 'forgot-password',
    title: 'Olvidé mi contraseña | ProConnect',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('../auth/pages/forgot-password/forgot-password.page').then(
        (m) => m.ForgotPasswordPage,
      ),
  },
  {
    path: 'reset-password/:token',
    title: 'Restablecer contraseña | ProConnect',
    loadComponent: () =>
      import('../auth/reset-password/reset-password.page').then(
        (m) => m.ResetPasswordPage,
      ),
  },
  {
    path: 'reset-password',
    title: 'Restablecer contraseña | ProConnect',
    loadComponent: () =>
      import('../auth/reset-password/reset-password.page').then(
        (m) => m.ResetPasswordPage,
      ),
  },
  {
    path: 'auth/oauth/callback',
    title: 'Completando inicio de sesion | ProConnect',
    loadComponent: () =>
      import('../auth/pages/oauth-callback/oauth-callback').then(
        (m) => m.OAuthCallbackPage,
      ),
  },


  {
    path: 'auth/email-verification-required',
    title: 'Verificar correo | ProConnect',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        '../auth/pages/email-verification-required/email-verification-required.page'
      ).then((m) => m.EmailVerificationRequiredPage),
  },
  {
    path: 'auth/verify-email',
    title: 'Verificando correo | ProConnect',
    loadComponent: () =>
      import('../auth/pages/verify-email/verify-email.page').then(
        (m) => m.VerifyEmailPage,
      ),
  },
];
