import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { TokenStorageService } from '../../auth/services/token-storage.service';

@Injectable({ providedIn: 'root' })
export class EchoService {

  private echo: Echo<any> | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: object,private tokenStorage: TokenStorageService) {}

  private init(): void {
    const token = this.tokenStorage.getAccessToken();

    if (!isPlatformBrowser(this.platformId)) return;
    if (this.echo) return;

    (window as any).Pusher = Pusher;

    this.echo = new Echo({
      broadcaster: 'pusher',
      key: 'proconnect-key',

      wsHost: '127.0.0.1',
      wsPort: 8080,

      cluster: 'mt1',

      forceTLS: false,
      encrypted: false,

      enabledTransports: ['ws'],

      authEndpoint: 'http://localhost/api/broadcasting/auth',

      auth: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
  }

  get instance(): Echo<any> {
    if(!this.echo) {
      this.init();
    }

    if (!this.echo) {
      throw new Error('Echo no disponible (no browser context)');
    }

    return this.echo;
  }

  public channel(name: string) {
    return this.instance.channel(name);
  }
}