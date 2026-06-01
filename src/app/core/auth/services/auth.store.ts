import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap, throwError } from 'rxjs';

import {
  AuthResponse,
  LoginRequest,
  MeResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateMeRequest,
  User,
} from '../models/auth.models';
import { AuthApi } from './auth.api';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authApi = inject(AuthApi);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.tokenStorage.accessToken());
  readonly isLoading = signal(false);

  login(payload: LoginRequest): Observable<AuthResponse> {
    this.isLoading.set(true);

    return this.authApi.login(payload).pipe(
      tap((response) => this.setAuthenticatedSession(response)),
      finalize(() => this.isLoading.set(false)),
    );
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    this.isLoading.set(true);

    return this.authApi.register(payload).pipe(finalize(() => this.isLoading.set(false)));
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
      map((response) => this.normalizeUser(response)),
      tap((user) => this.currentUser.set(user)),
      catchError((error: unknown) => {
        this.clearSession();
        return throwError(() => error);
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }

  updateCurrentUser(payload: UpdateMeRequest): Observable<User> {
    this.isLoading.set(true);

    return this.authApi.updateMe(payload).pipe(
      map((response) => this.normalizeUser(response)),
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

  clearSession(): void {
    this.tokenStorage.clear();
    this.currentUser.set(null);
  }

  private setAuthenticatedSession(response: AuthResponse): void {
    this.tokenStorage.setTokens(response.access_token, response.refresh_token);
    this.currentUser.set(response.user);
  }

  private normalizeUser(response: MeResponse | User): User {
    if ('user' in response) return response.user;
    return response;
  }
}
