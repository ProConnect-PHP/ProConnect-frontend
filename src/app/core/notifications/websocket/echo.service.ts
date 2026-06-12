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

      authorizer: (channel: any) => {
        return {
          authorize: (socketId: string, callback: Function) => {
            const token = this.tokenStorage.getAccessToken(); 
            fetch('http://localhost/api/broadcasting/auth', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                socket_id: socketId,
                channel_name: channel.name,
              }),
            })
              .then((res) => res.json())
              .then((data) => callback(false, data))
              .catch((err) => callback(true, err));
          },
        };
      },
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