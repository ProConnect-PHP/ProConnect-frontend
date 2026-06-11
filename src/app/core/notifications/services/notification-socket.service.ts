import { Injectable } from '@angular/core';
import { EchoService } from '../websocket/echo.service';
import { NotificationToastService } from './notification-toast.service';
import { NotificationStore } from './notification-store';

@Injectable({ providedIn: 'root' })
export class NotificationSocketService {

    private currentUserId: string | null = null;

    constructor(private echoService: EchoService, private toastService: NotificationToastService, private notificationStore: NotificationStore) {}

    subscribe(userId: string): void {
        if (this.currentUserId === userId) return;

        if (this.currentUserId) {
            this.unsubscribe();
        }

        this.currentUserId = userId;

        this.echoService.instance
            .private(`notifications.${userId}`)
            .listen('.notification.created', (event: any) => {
                console.log('[WS] Notificación recibida:', event);
                this.toastService.show('Has recibido una notificación');
                this.notificationStore.increment();
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

    unsubscribe(): void {
        if (!this.currentUserId) return;
        this.echoService.instance.leave(`notifications.${this.currentUserId}`);
        this.currentUserId = null;
    }
}