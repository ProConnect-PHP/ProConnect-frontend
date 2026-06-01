import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../http/api.client';
import {
  AuthResponse,
  LoginRequest,
  MeResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateMeRequest,
  User,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly api = inject(ApiClient);

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.api.post<RegisterResponse, RegisterRequest>('auth/register', payload);
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse, LoginRequest>('auth/login', payload);
  }

  refresh(refreshToken: string): Observable<RefreshTokenResponse> {
    const payload: RefreshTokenRequest = { refresh_token: refreshToken };
    return this.api.post<RefreshTokenResponse, RefreshTokenRequest>('auth/refresh', payload);
  }

  logout(): Observable<{ message: string }> {
    return this.api.post<{ message: string }, Record<string, never>>('auth/logout', {});
  }

  me(): Observable<MeResponse | User> {
    return this.api.get<MeResponse | User>('me');
  }

  updateMe(payload: UpdateMeRequest): Observable<MeResponse | User> {
    return this.api.put<MeResponse | User, UpdateMeRequest>('me', payload);
  }
}
