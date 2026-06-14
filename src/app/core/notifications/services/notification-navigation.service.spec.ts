import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthStore } from '../../auth/services/auth.store';
import { AppNotification } from '../models/notification.models';
import { NotificationStore } from './notification-store';

@Injectable({
  providedIn: 'root',
})
export class NotificationNavigationService {
  private readonly router = inject(Router);
  private readonly notificationStore = inject(NotificationStore);
  private readonly authStore = inject(AuthStore);

  activate(notification: AppNotification): void {
    if (!notification.is_read) {
      this.notificationStore.markAsRead(notification.id).subscribe();
    }

    const route = this.resolveRoute(notification);

    if (!route) {
      return;
    }

    void this.router.navigateByUrl(route);
  }

  private resolveRoute(notification: AppNotification): string | null {
    if (notification.action_route) {
      return notification.action_route;
    }

    if (notification.type.startsWith('booking.')) {
      return this.resolveBookingRoute(notification);
    }

    return null;
  }

  private resolveBookingRoute(notification: AppNotification): string | null {
    const bookingId = this.readStringMetadata(notification, 'booking_id');

    if (!bookingId) {
      return null;
    }

    const currentUser = this.authStore.currentUser();

    if (!currentUser) {
      return `/my-bookings/${bookingId}`;
    }

    const clientId = this.readStringMetadata(notification, 'client_id');

    if (clientId) {
      if (clientId === currentUser.id) {
        return `/my-bookings/${bookingId}`;
      }

      return `/professional/bookings/${bookingId}`;
    }

    if (currentUser.role === 'professional' || currentUser.role === 'admin') {
      return `/professional/bookings/${bookingId}`;
    }

    return `/my-bookings/${bookingId}`;
  }

  private readStringMetadata(
    notification: AppNotification,
    key: string,
  ): string | null {
    const value = notification.metadata?.[key];

    return typeof value === 'string' && value.trim().length > 0
      ? value
      : null;
  }
}
