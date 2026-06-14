import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { AuthResponse } from '../../../../core/auth/models/auth.models';
import { AuthRedirectService } from '../../../../core/auth/services/auth-redirect.service';
import { AuthStore } from '../../../../core/auth/services/auth.store';
import { TokenStorageService } from '../../../../core/auth/services/token-storage.service';
import { API_CONFIG } from '../../../../core/config/api.config';
import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { OAuthCallbackPage } from './oauth-callback';

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

describe('OAuthCallbackPage', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  it('navigates client users to their dashboard after exchanging the code', async () => {
    const { exchangeOAuthCode, navigateByUrl } = await setup(
      { code: 'oauth-code' },
      of(authResponse),
    );

    expect(exchangeOAuthCode).toHaveBeenCalledWith('oauth-code');
    expect(navigateByUrl).toHaveBeenCalledWith('/client/dashboard');
  });

  it('does not send a client to a professional return URL', async () => {
    const { navigateByUrl } = await setup(
      { code: 'oauth-code', returnUrl: '/dashboard' },
      of(authResponse),
    );

    expect(navigateByUrl).toHaveBeenCalledWith(
      '/professional/onboarding?returnUrl=%2Fdashboard',
    );
  });

  it('respects an allowed client return URL', async () => {
    const { navigateByUrl } = await setup(
      { code: 'oauth-code', returnUrl: '/my-payments' },
      of(authResponse),
    );

    expect(navigateByUrl).toHaveBeenCalledWith('/my-payments');
  });

  it('navigates professional users to the dashboard', async () => {
    const professionalResponse: AuthResponse = {
      ...authResponse,
      user: {
        ...authResponse.user,
        role: 'professional',
      },
    };

    const { navigateByUrl } = await setup(
      { code: 'oauth-code' },
      of(professionalResponse),
    );

    expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error when the callback has no code', async () => {
    const { fixture, exchangeOAuthCode } = await setup({}, of(authResponse));

    expect(exchangeOAuthCode).not.toHaveBeenCalled();
    expect(fixture.componentInstance.errorMessage()).toContain(
      'No recibimos el codigo de autenticacion',
    );
  });

  it('shows a clear error and logs exchange details in development', async () => {
    const error = new ApiClientError('Exchange rejected', 422, 'ValidationError');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const { fixture } = await setup(
      { code: 'invalid-code' },
      throwError(() => error),
    );

    expect(fixture.componentInstance.errorMessage()).toContain('No pudimos validar tu cuenta');
    expect(consoleError).toHaveBeenCalledWith('OAuth exchange failed.', {
      status: 422,
      url: 'http://localhost:80/api/v1/auth/oauth/exchange',
      body: {
        type: 'ValidationError',
        message: 'Exchange rejected',
        details: null,
      },
    });
  });
});

async function setup(
  queryParams: Record<string, string>,
  response: Observable<AuthResponse>,
) {
  const exchangeOAuthCode = vi.fn(() => response);
  const navigateByUrl = vi.fn(async () => true);

  await TestBed.configureTestingModule({
    imports: [OAuthCallbackPage],
    providers: [
      AuthRedirectService,
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParamMap: convertToParamMap(queryParams),
          },
        },
      },
      {
        provide: Router,
        useValue: { navigateByUrl },
      },
      {
        provide: AuthStore,
        useValue: { exchangeOAuthCode },
      },
      {
        provide: TokenStorageService,
        useValue: {
          getAccessToken: () => 'access-token',
          getRefreshToken: () => 'refresh-token',
        },
      },
      {
        provide: API_CONFIG,
        useValue: { baseUrl: 'http://localhost:80/api/v1' },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(OAuthCallbackPage);
  fixture.detectChanges();
  await fixture.whenStable();

  return { fixture, exchangeOAuthCode, navigateByUrl };
}
