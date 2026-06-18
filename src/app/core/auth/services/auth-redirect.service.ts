import { Injectable } from '@angular/core';

import { User } from '../models/auth.models';
import { hasProfessionalAccess } from '../utils/auth-capabilities';

@Injectable({ providedIn: 'root' })
export class AuthRedirectService {
  getPostLoginRedirect(user: User, requestedUrl: string | null = null): string {
    if (requestedUrl && this.isInternalUrl(requestedUrl)) {
      if (this.isBlockedGuestUrl(requestedUrl)) {
        return this.getDefaultRedirect(user);
      }

      if (this.isAdminPath(requestedUrl) && !this.hasAdminAccess(user)) {
        return this.getDefaultRedirect(user);
      }

      if (this.isProfessionalPath(requestedUrl) && !hasProfessionalAccess(user)) {
        return `/professional/onboarding?returnUrl=${encodeURIComponent(requestedUrl)}`;
      }

      if (this.isAllowedReturnUrl(requestedUrl)) {
        return requestedUrl;
      }
    }

    return this.getDefaultRedirect(user);
  }

  private getDefaultRedirect(user: User): string {
    if (this.hasAdminAccess(user)) {
      return '/admin';
    }

    if (hasProfessionalAccess(user)) {
      return '/dashboard';
    }

    return '/my-bookings';
  }

  private isAllowedReturnUrl(url: string): boolean {
    return (
      this.isInternalUrl(url) &&
      !this.isBlockedGuestUrl(url)
    );
  }

  private isInternalUrl(url: string): boolean {
    return url.startsWith('/') && !url.startsWith('//') && !url.includes('\\');
  }

  private isBlockedGuestUrl(url: string): boolean {
    const path = this.extractPath(url);

    return (
      path === '/login' ||
      path === '/register' ||
      path === '/auth/oauth/callback' ||
      path === '/reset-password'
    );
  }

  private isProfessionalPath(url: string): boolean {
    const path = this.extractPath(url);

    if (path.startsWith('/professional/onboarding')) {
      return false;
    }

    return (
      path === '/dashboard' ||
      path.startsWith('/dashboard/') ||
      path === '/professional' ||
      path.startsWith('/professional/')
    );
  }

  private isAdminPath(url: string): boolean {
    const path = this.extractPath(url);

    return path === '/admin' || path.startsWith('/admin/');
  }

  private hasAdminAccess(user: User): boolean {
    return user.role === 'admin';
  }

  private extractPath(url: string): string {
    return url.split(/[?#]/, 1)[0];
  }
}
