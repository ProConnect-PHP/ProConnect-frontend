import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';

import { User } from '../models/auth.models';
import { AuthRedirectService } from '../services/auth-redirect.service';
import { AuthStore } from '../services/auth.store';
import { TokenStorageService } from '../services/token-storage.service';
import { adminGuard } from './admin.guard';
import { authGuard } from './auth.guard';
import { guestGuard } from './guest.guard';
import { professionalGuard } from './professional.guard';

const client: User = {
  id: 'client-1',
  name: 'Client User',
  email: 'client@example.com',
  role: 'client',
  avatar_url: null,
};

const professional: User = {
  ...client,
  id: 'professional-1',
  role: 'professional',
};

const admin: User = {
  ...client,
  id: 'admin-1',
  role: 'admin',
};

describe('auth guards', () => {
  const loginTree = { kind: 'login' } as unknown as UrlTree;
  const clientTree = { kind: 'client' } as unknown as UrlTree;
  const professionalTree = { kind: 'professional' } as unknown as UrlTree;
  const adminTree = { kind: 'admin' } as unknown as UrlTree;
  const onboardingTree = { kind: 'onboarding' } as unknown as UrlTree;
  const rootTree = { kind: 'root' } as unknown as UrlTree;
  const createUrlTree = vi.fn((commands: string[]) => {
    if (commands[0] === '/professional/onboarding') return onboardingTree;
    if (commands[0] === '/') return rootTree;
    return loginTree;
  });
  const parseUrl = vi.fn((url: string) => {
    if (url === '/admin') return adminTree;
    if (url === '/dashboard') return professionalTree;
    return clientTree;
  });
  const isAuthenticated = vi.fn(() => false);
  const currentUser = vi.fn<() => User | null>(() => null);
  const loadCurrentUser = vi.fn(() => of<User | null>(null));
  const hasSession = vi.fn(() => false);

  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    createUrlTree.mockClear();
    parseUrl.mockClear();
    isAuthenticated.mockReset();
    isAuthenticated.mockReturnValue(false);
    currentUser.mockReset();
    currentUser.mockReturnValue(null);
    loadCurrentUser.mockReset();
    loadCurrentUser.mockReturnValue(of(null));
    hasSession.mockReset();
    hasSession.mockReturnValue(false);

    TestBed.configureTestingModule({
      providers: [
        AuthRedirectService,
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated,
            currentUser,
            loadCurrentUser,
          },
        },
        {
          provide: TokenStorageService,
          useValue: { hasSession },
        },
        {
          provide: Router,
          useValue: { createUrlTree, parseUrl },
        },
      ],
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('allows protected routes when the access token signal is available', () => {
    isAuthenticated.mockReturnValue(true);
    hasSession.mockReturnValue(true);
    currentUser.mockReturnValue(client);

    const result = runGuard(authGuard, '/my-bookings');

    expect(result).toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('hydrates the current user before activating a restored browser session', async () => {
    isAuthenticated.mockReturnValue(true);
    hasSession.mockReturnValue(true);
    loadCurrentUser.mockReturnValue(of(client));

    const result = runGuard(authGuard, '/my-bookings') as Observable<boolean | UrlTree>;

    await expect(firstValueFrom(result)).resolves.toBe(true);
    expect(loadCurrentUser).toHaveBeenCalledOnce();
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects unauthenticated users to login and preserves the requested URL', () => {
    const result = runGuard(authGuard, '/my-bookings');

    expect(result).toBe(loginTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: {
        returnUrl: '/my-bookings',
        redirectTo: '/my-bookings',
      },
    });
  });

  it('redirects authenticated client users away from guest routes', () => {
    isAuthenticated.mockReturnValue(true);
    currentUser.mockReturnValue(client);

    const result = runGuard(guestGuard, '/login');

    expect(result).toBe(clientTree);
    expect(parseUrl).toHaveBeenCalledWith('/my-bookings');
  });

  it('redirects authenticated professional users to the professional dashboard', () => {
    isAuthenticated.mockReturnValue(true);
    currentUser.mockReturnValue(professional);

    const result = runGuard(guestGuard, '/login');

    expect(result).toBe(professionalTree);
    expect(parseUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects authenticated admin users to the admin panel', () => {
    isAuthenticated.mockReturnValue(true);
    currentUser.mockReturnValue(admin);

    const result = runGuard(guestGuard, '/login');

    expect(result).toBe(adminTree);
    expect(parseUrl).toHaveBeenCalledWith('/admin');
  });

  it('blocks client users from professional routes', () => {
    isAuthenticated.mockReturnValue(true);
    currentUser.mockReturnValue(client);

    const result = runGuard(professionalGuard, '/dashboard');

    expect(result).toBe(onboardingTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/professional/onboarding'], {
      queryParams: {
        returnUrl: '/dashboard',
      },
    });
  });

  it('allows professional users into professional routes', () => {
    isAuthenticated.mockReturnValue(true);
    currentUser.mockReturnValue(professional);

    expect(runGuard(professionalGuard, '/dashboard')).toBe(true);
  });

  it('allows a client role with an active professional profile', () => {
    isAuthenticated.mockReturnValue(true);
    currentUser.mockReturnValue({
      ...client,
      has_professional_profile: true,
    });

    expect(runGuard(professionalGuard, '/dashboard')).toBe(true);
  });

  it('sends unauthenticated professional-route requests to login', () => {
    const result = runGuard(professionalGuard, '/dashboard');

    expect(result).toBe(loginTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: {
        returnUrl: '/dashboard',
        redirectTo: '/dashboard',
      },
    });
  });

  it('allows admin users into admin routes', () => {
    isAuthenticated.mockReturnValue(true);
    currentUser.mockReturnValue(admin);

    expect(runGuard(adminGuard, '/admin')).toBe(true);
  });

  it('hydrates the current admin before activating an admin route', async () => {
    isAuthenticated.mockReturnValue(true);
    loadCurrentUser.mockReturnValue(of(admin));

    const result = runGuard(adminGuard, '/admin') as Observable<boolean | UrlTree>;

    await expect(firstValueFrom(result)).resolves.toBe(true);
    expect(loadCurrentUser).toHaveBeenCalledOnce();
  });

  it('blocks non-admin users from admin routes', () => {
    isAuthenticated.mockReturnValue(true);
    currentUser.mockReturnValue(professional);

    const result = runGuard(adminGuard, '/admin/users');

    expect(result).toBe(rootTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/']);
  });

  it('sends unauthenticated admin-route requests to login', () => {
    const result = runGuard(adminGuard, '/admin');

    expect(result).toBe(loginTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: {
        returnUrl: '/admin',
        redirectTo: '/admin',
      },
    });
  });
});

function runGuard(guard: CanActivateFn, url: string): ReturnType<CanActivateFn> {
  return TestBed.runInInjectionContext(() =>
    guard(
      {} as ActivatedRouteSnapshot,
      { url } as RouterStateSnapshot,
    ),
  );
}
