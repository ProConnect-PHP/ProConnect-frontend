import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  isDevMode,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthResponse } from '../../../../core/auth/models/auth.models';
import { AuthRedirectService } from '../../../../core/auth/services/auth-redirect.service';
import { AuthStore } from '../../../../core/auth/services/auth.store';
import { TokenStorageService } from '../../../../core/auth/services/token-storage.service';
import { API_CONFIG } from '../../../../core/config/api.config';
import { ApiClientError } from '../../../../core/http/models/api-error.model';

@Component({
  selector: 'app-oauth-callback',
  imports: [],
  templateUrl: './oauth-callback.html',
  styleUrl: './oauth-callback.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OAuthCallbackPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly authRedirect = inject(AuthRedirectService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly destroyRef = inject(DestroyRef);

  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');

    if (!code) {
      this.errorMessage.set(
        'No recibimos el codigo de autenticacion. Inicia el proceso nuevamente.',
      );
      return;
    }

    this.logExchangeCode(code);

    this.authStore
      .exchangeOAuthCode(code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.logExchangeSuccess(response);

          const requestedUrl =
            this.route.snapshot.queryParamMap.get('returnUrl') ??
            this.route.snapshot.queryParamMap.get('redirectTo');
          const destination = this.authRedirect.getPostLoginRedirect(
            response.user,
            requestedUrl,
          );

          this.logDestination(destination);
          void this.router.navigateByUrl(destination);
        },
        error: (error: unknown) => {
          this.logExchangeError(error);
          this.errorMessage.set(
            'No pudimos validar tu cuenta. El enlace puede haber expirado; intenta iniciar sesion nuevamente.',
          );
        },
      });
  }

  goToLogin(): void {
    void this.router.navigateByUrl('/login');
  }

  private logExchangeError(error: unknown): void {
    if (!isDevMode()) return;

    const body =
      error instanceof ApiClientError
        ? {
            type: error.type,
            message: error.message,
            details: error.details,
          }
        : error;

    console.error('OAuth exchange failed.', {
      status: error instanceof ApiClientError ? error.status : null,
      url: `${this.apiConfig.baseUrl.replace(/\/+$/, '')}/auth/oauth/exchange`,
      body,
    });
  }

  private logExchangeCode(code: string): void {
    if (!isDevMode()) return;

    console.debug('OAuth callback code received.', {
      code: `${code.slice(0, 8)}...`,
    });
  }

  private logExchangeSuccess(response: AuthResponse): void {
    if (!isDevMode()) return;

    console.debug('OAuth exchange completed.', {
      token_type: response.token_type,
      expires_in: response.expires_in,
      user: response.user,
      access_token_received: !!response.access_token,
      refresh_token_received: !!response.refresh_token,
      access_token_stored: !!this.tokenStorage.getAccessToken(),
      refresh_token_stored: !!this.tokenStorage.getRefreshToken(),
    });
  }

  private logDestination(destination: string): void {
    if (!isDevMode()) return;

    console.debug('OAuth post-login destination calculated.', { destination });
  }
}
