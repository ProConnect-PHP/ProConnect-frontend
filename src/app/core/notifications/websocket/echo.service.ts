import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import type Echo from 'laravel-echo';
import type Pusher from 'pusher-js';
import type { AuthorizerCallback } from 'pusher-js';

import { REALTIME_CONFIG } from '../../config/realtime.config';

interface AuthorizableChannel {
  name: string;
}

interface ChannelAuthorizationData {
  auth: string;
  channel_data?: string;
  shared_secret?: string;
}

@Injectable({ providedIn: 'root' })
export class EchoService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly config = inject(REALTIME_CONFIG);
  private echo: Echo<'reverb'> | null = null;
  private initialization: Promise<Echo<'reverb'> | null> | null = null;

  async listenPrivate(
    channelName: string,
    eventName: string,
    callback: (payload: unknown) => void,
  ): Promise<boolean> {
    const echo = await this.getInstance();
    if (!echo) return false;

    echo.private(channelName).listen(eventName, callback);
    return true;
  }

  leave(channelName: string): void {
    this.echo?.leave(channelName);
  }

  disconnect(): void {
    this.echo?.disconnect();
    this.echo = null;
  }

  private getInstance(): Promise<Echo<'reverb'> | null> {
    if (!isPlatformBrowser(this.platformId) || !this.config.enabled) {
      return Promise.resolve(null);
    }

    if (this.echo) return Promise.resolve(this.echo);
    if (this.initialization) return this.initialization;

    this.initialization = this.createInstance().finally(() => {
      this.initialization = null;
    });

    return this.initialization;
  }

  private async createInstance(): Promise<Echo<'reverb'> | null> {
    try {
      const [{ default: EchoConstructor }, { default: PusherConstructor }] =
        await Promise.all([import('laravel-echo'), import('pusher-js')]);
      const browserWindow = window as typeof window & { Pusher: typeof Pusher };
      browserWindow.Pusher = PusherConstructor;

      this.echo = new EchoConstructor<'reverb'>({
        broadcaster: 'reverb',
        key: this.config.key,
        wsHost: this.config.wsHost,
        wsPort: this.config.wsPort,
        wssPort: this.config.wssPort,
        forceTLS: this.config.forceTLS,
        enabledTransports: this.config.forceTLS ? ['wss'] : ['ws'],
        disableStats: true,
        authorizer: (channel: AuthorizableChannel) => ({
          authorize: (socketId: string, callback: AuthorizerCallback) => {
            this.http
              .post<ChannelAuthorizationData>(this.config.authEndpoint, {
                socket_id: socketId,
                channel_name: channel.name,
              })
              .subscribe({
                next: (response) => callback(null, response),
                error: (error: unknown) =>
                  callback(
                    error instanceof Error
                      ? error
                      : new Error('No se pudo autorizar el canal privado.'),
                    null,
                  ),
              });
          },
        }),
      });

      return this.echo;
    } catch {
      return null;
    }
  }
}
