import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class NetworkStatusService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly online = signal<boolean>(this.getInitialOnlineStatus());

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    const handleOnline = (): void => {
      this.online.set(true);
    };

    const handleOffline = (): void => {
      this.online.set(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    });
  }

  private getInitialOnlineStatus(): boolean {
    if (!this.isBrowser) {
      return true;
    }

    return navigator.onLine;
  }
}
