import { Injectable } from '@angular/core';

import { User } from '../models/auth.models';
import { hasProfessionalAccess } from '../utils/auth-capabilities';

@Injectable({ providedIn: 'root' })
export class AuthRedirectService {
  getPostLoginRedirect(user: User, requestedUrl: string | null = null): string {
    if (requestedUrl && this.isInternalUrl(requestedUrl)) {
      if (this.isProfessionalPath(requestedUrl) && !hasProfessionalAccess(user)) {
        return `/professional/onboarding?returnUrl=${encodeURIComponent(requestedUrl)}`;
      }

      if (this.isAllowedReturnUrl(requestedUrl)) return requestedUrl;
    }

    if (user.role === 'admin') return '/admin';
    if (hasProfessionalAccess(user)) return '/dashboard';

    return '/my-bookings';
  }

  private isAllowedReturnUrl(url: string): boolean {
    const path = url.split(/[?#]/, 1)[0];
    return path !== '/login' && path !== '/register' && path !== '/auth/oauth/callback';
  }

  private isInternalUrl(url: string): boolean {
    return url.startsWith('/') && !url.startsWith('//') && !url.includes('\\');
  }

  private isProfessionalPath(path: string): boolean {
    const normalizedPath = path.split(/[?#]/, 1)[0];
    if (normalizedPath.startsWith('/professional/onboarding')) return false;

    return (
      normalizedPath === '/dashboard' ||
      normalizedPath.startsWith('/dashboard/') ||
      normalizedPath === '/professional' ||
      normalizedPath.startsWith('/professional/')
    );
  }
}
