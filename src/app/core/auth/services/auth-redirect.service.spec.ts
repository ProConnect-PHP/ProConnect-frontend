import { TestBed } from '@angular/core/testing';

import { User } from '../models/auth.models';
import { AuthRedirectService } from './auth-redirect.service';

const client: User = {
  id: 'client-1',
  name: 'Client User',
  email: 'client@example.com',
  role: 'client',
  avatar_url: null,
  email_verified_at: null,
  email_verified: false,
};

const admin: User = {
  ...client,
  id: 'admin-1',
  role: 'admin',
};

describe('AuthRedirectService', () => {
  let service: AuthRedirectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthRedirectService);
  });

  it('sends a client to their bookings by default', () => {
    expect(service.getPostLoginRedirect(client)).toBe('/my-bookings');
  });

  it('sends an admin to the admin panel by default', () => {
    expect(service.getPostLoginRedirect(admin)).toBe('/admin');
  });

  it('sends users with professional capability to the professional panel', () => {
    expect(
      service.getPostLoginRedirect({
        ...client,
        has_professional_profile: true,
      }),
    ).toBe('/dashboard');
    expect(
      service.getPostLoginRedirect({
        ...client,
        professional_profile_status: 'active',
      }),
    ).toBe('/dashboard');
  });

  it('respects an allowed client return URL', () => {
    expect(service.getPostLoginRedirect(client, '/my-payments')).toBe('/my-payments');
    expect(service.getPostLoginRedirect(client, '/professional/onboarding')).toBe(
      '/professional/onboarding',
    );
    expect(service.getPostLoginRedirect(client, '/professional/onboarding/profile')).toBe(
      '/professional/onboarding/profile',
    );
  });

  it('sends a client requesting a professional route to onboarding', () => {
    expect(service.getPostLoginRedirect(client, '/dashboard/services/new')).toBe(
      '/professional/onboarding?returnUrl=%2Fdashboard%2Fservices%2Fnew',
    );
  });

  it('rejects external and auth return URLs', () => {
    expect(service.getPostLoginRedirect(client, '//example.com')).toBe('/my-bookings');
    expect(service.getPostLoginRedirect(client, '/login')).toBe('/my-bookings');
  });
});
