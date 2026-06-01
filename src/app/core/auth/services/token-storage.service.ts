import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly accessTokenKey = 'proconnect.access_token';
  private readonly refreshTokenKey = 'proconnect.refresh_token';

  readonly accessToken = signal<string | null>(this.readToken(this.accessTokenKey));
  readonly refreshToken = signal<string | null>(this.readToken(this.refreshTokenKey));

  setTokens(accessToken: string, refreshToken: string): void {
    const storage = this.getStorage();
    this.accessToken.set(accessToken);
    this.refreshToken.set(refreshToken);

    if (!storage) return;

    storage.setItem(this.accessTokenKey, accessToken);
    storage.setItem(this.refreshTokenKey, refreshToken);
  }

  setAccessToken(accessToken: string): void {
    this.accessToken.set(accessToken);
    this.getStorage()?.setItem(this.accessTokenKey, accessToken);
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  getRefreshToken(): string | null {
    return this.refreshToken();
  }

  hasSession(): boolean {
    return !!this.accessToken();
  }

  clear(): void {
    const storage = this.getStorage();
    this.accessToken.set(null);
    this.refreshToken.set(null);

    if (!storage) return;

    storage.removeItem(this.accessTokenKey);
    storage.removeItem(this.refreshTokenKey);
  }

  private readToken(key: string): string | null {
    return this.getStorage()?.getItem(key) ?? null;
  }

  private getStorage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage;
  }
}
