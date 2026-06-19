import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { ApiClient } from '../../http/api.client';
import { AuthResponse } from '../models/auth.models';
import { AuthApi } from './auth.api';

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

describe('AuthApi OAuth', () => {
  const post = vi.fn(() => of(authResponse));
  const redirect = vi.fn();

  beforeEach(() => {
    post.mockClear();
    redirect.mockClear();

    TestBed.configureTestingModule({
      providers: [
        AuthApi,
        {
          provide: ApiClient,
          useValue: { post, redirect },
        },
      ],
    });
  });

  it('exchanges the code using a relative API path', async () => {
    const api = TestBed.inject(AuthApi);

    await expect(firstValueFrom(api.exchangeOAuthCode('oauth-code'))).resolves.toEqual(
      authResponse,
    );
    expect(post).toHaveBeenCalledWith('auth/oauth/exchange', { code: 'oauth-code' });
  });

  it('redirects to the provider using a relative API path', () => {
    const api = TestBed.inject(AuthApi);

    api.redirectToOAuthProvider('google');

    expect(redirect).toHaveBeenCalledWith('auth/oauth/google/redirect');
  });
});
