import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';

import { ApiClientError } from '../../http/models/api-error.model';
import { AuthResponse, User } from '../models/auth.models';
import { AuthApi } from './auth.api';
import { AuthStore } from './auth.store';
import { TokenStorageService } from './token-storage.service';

const authResponse: AuthResponse = {
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  user: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'client',
    avatar_url: null,
  },
};

function normalizeExpectedUser(user: User): User {
  return {
    ...user,
    email_verified_at: user.email_verified_at ?? null,
    email_verified: user.email_verified === true || !!user.email_verified_at,
  };
}

describe('AuthStore', () => {
  const accessToken = signal<string | null>(null);
  const refreshToken = signal<string | null>(null);
  const exchangeOAuthCode = vi.fn(() => of(authResponse));
  const redirectToOAuthProvider = vi.fn();
  const me = vi.fn(() => of(authResponse.user));
  const setTokens = vi.fn((nextAccessToken: string, nextRefreshToken: string) => {
    accessToken.set(nextAccessToken);
    refreshToken.set(nextRefreshToken);
  });
  const clear = vi.fn(() => {
    accessToken.set(null);
    refreshToken.set(null);
  });

  beforeEach(() => {
    accessToken.set(null);
    refreshToken.set(null);

    exchangeOAuthCode.mockReset();
    exchangeOAuthCode.mockReturnValue(of(authResponse));

    redirectToOAuthProvider.mockClear();

    me.mockReset();
    me.mockReturnValue(of(authResponse.user));

    setTokens.mockClear();
    clear.mockClear();

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        {
          provide: AuthApi,
          useValue: {
            exchangeOAuthCode,
            redirectToOAuthProvider,
            me,
          },
        },
        {
          provide: TokenStorageService,
          useValue: {
            accessToken,
            refreshToken,
            setTokens,
            clear,
            hasSession: () => !!accessToken(),
            getRefreshToken: () => refreshToken(),
          },
        },
      ],
    });
  });

  it('stores OAuth tokens and user through the normal authenticated session flow', async () => {
    const store = TestBed.inject(AuthStore);

    await expect(firstValueFrom(store.exchangeOAuthCode('oauth-code'))).resolves.toEqual({
      ...authResponse,
      user: normalizeExpectedUser(authResponse.user),
    });

    expect(exchangeOAuthCode).toHaveBeenCalledWith('oauth-code');
    expect(setTokens).toHaveBeenCalledWith('access-token', 'refresh-token');
    expect(store.currentUser()).toEqual(normalizeExpectedUser(authResponse.user));
    expect(store.isAuthenticated()).toBe(true);
    expect(store.isLoading()).toBe(false);
  });

  it('keeps the session when loading the current user fails with a non-auth error', async () => {
    setTokens('access-token', 'refresh-token');
    me.mockReturnValueOnce(
      throwError(() => new ApiClientError('Forbidden', 403, 'Forbidden')),
    );
    const store = TestBed.inject(AuthStore);

    await expect(firstValueFrom(store.loadCurrentUser())).rejects.toMatchObject({
      status: 403,
    });

    expect(clear).not.toHaveBeenCalled();
    expect(store.isAuthenticated()).toBe(true);
  });

  it('clears the session when loading the current user fails with 401', async () => {
    setTokens('access-token', 'refresh-token');
    me.mockReturnValueOnce(
      throwError(() => new ApiClientError('Unauthorized', 401, 'Unauthorized')),
    );
    const store = TestBed.inject(AuthStore);

    await expect(firstValueFrom(store.loadCurrentUser())).rejects.toMatchObject({
      status: 401,
    });

    expect(clear).toHaveBeenCalledOnce();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('delegates provider redirects to AuthApi', () => {
    const store = TestBed.inject(AuthStore);

    store.redirectToOAuthProvider('google');

    expect(redirectToOAuthProvider).toHaveBeenCalledWith('google');
  });

  it('updates the current user without replacing the authenticated session', () => {
    setTokens('access-token', 'refresh-token');
    const store = TestBed.inject(AuthStore);
    const professional: User = {
      ...authResponse.user,
      role: 'professional',
      has_professional_profile: true,
    };

    store.setCurrentUser(professional);

    expect(store.currentUser()).toEqual(normalizeExpectedUser(professional));
    expect(store.isAuthenticated()).toBe(true);
    expect(setTokens).toHaveBeenCalledOnce();
  });
});
