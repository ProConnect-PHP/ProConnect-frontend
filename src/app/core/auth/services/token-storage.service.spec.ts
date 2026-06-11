import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('keeps browser storage, getters and signals in sync', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    const storage = TestBed.inject(TokenStorageService);

    storage.setTokens('access-token', 'refresh-token');

    expect(storage.accessToken()).toBe('access-token');
    expect(storage.refreshToken()).toBe('refresh-token');
    expect(storage.getAccessToken()).toBe('access-token');
    expect(storage.getRefreshToken()).toBe('refresh-token');
    expect(storage.hasSession()).toBe(true);
    expect(localStorage.getItem('proconnect.access_token')).toBe('access-token');
    expect(localStorage.getItem('proconnect.refresh_token')).toBe('refresh-token');
  });

  it('hydrates its signals from browser storage', () => {
    localStorage.setItem('proconnect.access_token', 'stored-access-token');
    localStorage.setItem('proconnect.refresh_token', 'stored-refresh-token');
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });

    const storage = TestBed.inject(TokenStorageService);

    expect(storage.accessToken()).toBe('stored-access-token');
    expect(storage.refreshToken()).toBe('stored-refresh-token');
    expect(storage.hasSession()).toBe(true);
  });

  it('updates signals without reading or writing browser storage during SSR', () => {
    localStorage.setItem('proconnect.access_token', 'browser-access-token');
    localStorage.setItem('proconnect.refresh_token', 'browser-refresh-token');
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const storage = TestBed.inject(TokenStorageService);

    expect(storage.accessToken()).toBeNull();
    expect(storage.refreshToken()).toBeNull();

    storage.setTokens('server-access-token', 'server-refresh-token');

    expect(storage.accessToken()).toBe('server-access-token');
    expect(storage.refreshToken()).toBe('server-refresh-token');
    expect(localStorage.getItem('proconnect.access_token')).toBe('browser-access-token');
    expect(localStorage.getItem('proconnect.refresh_token')).toBe('browser-refresh-token');
  });
});
