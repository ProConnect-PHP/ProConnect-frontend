import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap, throwError } from 'rxjs';

import {
  AuthResponse,
  LoginRequest,
  MeResponse,
  OAuthProvider,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateMeRequest,
  User,
} from '../models/auth.models';
import { AuthApi } from './auth.api';
import { TokenStorageService } from './token-storage.service';
import { ApiClientError } from '../../http/models/api-error.model';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authApi = inject(AuthApi);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly currentUser = signal<User | null>(null);

  readonly isAuthenticated = computed(() => !!this.tokenStorage.accessToken());

  readonly isEmailVerified = computed(() => {
    const user = this.currentUser();

    return user?.email_verified === true || !!user?.email_verified_at;
  });

  readonly requiresEmailVerification = computed(() => {
    return this.isAuthenticated() && !this.isEmailVerified();
  });

  readonly isLoading = signal(false);

  login(payload: LoginRequest): Observable<AuthResponse> {
    this.isLoading.set(true);

    return this.authApi.login(payload).pipe(
      map((response) => this.normalizeAuthResponse(response)),
      tap((response) => this.setAuthenticatedSession(response)),
      finalize(() => this.isLoading.set(false)),
    );
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    this.isLoading.set(true);

    return this.authApi.register(payload).pipe(
      map((response) => ({
        ...response,
        user: this.normalizeUser(response.user),
      })),
      finalize(() => this.isLoading.set(false)),
    );
  }

  logout(): Observable<void> {
    this.isLoading.set(true);

    return this.authApi.logout().pipe(
      map(() => undefined),
      catchError((error: unknown) => {
        this.clearSession();
        return throwError(() => error);
      }),
      tap(() => this.clearSession()),
      finalize(() => this.isLoading.set(false)),
    );
  }

  loadCurrentUser(): Observable<User | null> {
    if (!this.tokenStorage.hasSession()) {
      this.clearSession();
      return of(null);
    }

    this.isLoading.set(true);

    return this.authApi.me().pipe(
      map((response) => this.normalizeUserResponse(response)),
      tap((user) => this.currentUser.set(user)),
      catchError((error: unknown) => {
        if (error instanceof ApiClientError && error.status === 401) {
          this.clearSession();
        }

        return throwError(() => error);
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }

  updateCurrentUser(payload: UpdateMeRequest): Observable<User> {
    this.isLoading.set(true);

    return this.authApi.updateMe(payload).pipe(
      map((response) => this.normalizeUserResponse(response)),
      tap((user) => this.currentUser.set(user)),
      finalize(() => this.isLoading.set(false)),
    );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();

    if (!refreshToken) {
      this.clearSession();

      return throwError(() => new Error('No refresh token is available.'));
    }

    return this.authApi.refresh(refreshToken).pipe(
      tap((response) => {
        this.tokenStorage.setTokens(response.access_token, response.refresh_token);
      }),
    );
  }

  redirectToOAuthProvider(provider: OAuthProvider): void {
    this.authApi.redirectToOAuthProvider(provider);
  }

  exchangeOAuthCode(code: string): Observable<AuthResponse> {
    this.isLoading.set(true);

    return this.authApi.exchangeOAuthCode(code).pipe(
      map((response) => this.normalizeAuthResponse(response)),
      tap((response) => this.setAuthenticatedSession(response)),
      finalize(() => this.isLoading.set(false)),
    );
  }

  setCurrentUser(user: User): void {
    this.currentUser.set(this.normalizeUser(user));
  }

  clearSession(): void {
    this.tokenStorage.clear();
    this.currentUser.set(null);
  }

  private setAuthenticatedSession(response: AuthResponse): void {
    this.tokenStorage.setTokens(response.access_token, response.refresh_token);
    this.currentUser.set(this.normalizeUser(response.user));
  }

  private normalizeAuthResponse(response: AuthResponse): AuthResponse {
    return {
      ...response,
      user: this.normalizeUser(response.user),
    };
  }

  private normalizeUserResponse(response: MeResponse | User): User {
    if ('user' in response) {
      return this.normalizeUser(response.user);
    }

    return this.normalizeUser(response);
  }

  private normalizeUser(user: User): User {
    return {
      ...user,
      email_verified: user.email_verified === true || !!user.email_verified_at,
    };
  }
}
