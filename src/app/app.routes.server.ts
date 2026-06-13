import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'auth/oauth/callback',
    renderMode: RenderMode.Client,
  },
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'register',
    renderMode: RenderMode.Client,
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Client,
  },
  {
    path: 'notifications',
    renderMode: RenderMode.Client,
  },
  {
    path: 'dashboard/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'my-bookings',
    renderMode: RenderMode.Client,
  },
  {
    path: 'my-bookings/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'my-payments',
    renderMode: RenderMode.Client,
  },
  {
    path: 'payments/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'my-packages',
    renderMode: RenderMode.Client,
  },
  {
    path: 'video-sessions/my',
    renderMode: RenderMode.Client,
  },
  {
    path: 'video-sessions/:bookingId/join',
    renderMode: RenderMode.Client,
  },
  {
    path: 'client-packages/:clientPackageId',
    renderMode: RenderMode.Client,
  },
  {
    path: 'professional/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
