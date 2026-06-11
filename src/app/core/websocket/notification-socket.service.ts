import { Injectable } from '@angular/core';
import { EchoService } from './echo.service';

@Injectable({ providedIn: 'root' })
export class NotificationSocketService {

    private currentUserId: string | null = null;

    constructor(private echoService: EchoService) {}

    subscribe(userId: string): void {
        if (this.currentUserId === userId) return;

        if (this.currentUserId) {
            this.unsubscribe(this.currentUserId);
        }

        this.currentUserId = userId;

        this.echoService.instance
            .private(`notifications.${userId}`)
            .listen('.notification.created', (event: any) => {
                console.log('Notificación recibida:', event);

                alert(`Nueva notificación: ${event.message}`);
            });
        
        // Debuggin
        // const channelName = `notifications.${userId}`;

        // console.log('[WS] intentando suscribirse a:', channelName);

        // const channel = this.echoService.instance.private(channelName);
    
        // channel.subscribed(() => {
        //     console.log('[WS] SUSCRITO OK a:', channelName);
        // });

        // channel.error((error: any) => {
        //     console.error('[WS] ERROR en canal:', error);
        // });

        // channel.listen('.notification.created', (event: any) => {
        //     console.log('[WS] EVENTO RECIBIDO:', event);
        // });
    }

    unsubscribe(userId: string): void {
        this.echoService.instance
            .leave(`notifications.${userId}`);

        if (this.currentUserId === userId) {
            this.currentUserId = null;
        }
    }
}