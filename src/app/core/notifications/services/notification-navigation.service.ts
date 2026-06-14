import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthStore } from '../../auth/services/auth.store';
import { hasProfessionalAccess } from '../../auth/utils/auth-capabilities';
import { AppNotification } from '../models/notification.models';
import { NotificationStore } from './notification-store';

@Injectable({ providedIn: 'root' })
export class NotificationNavigationService {
  private readonly router = inject(Router);
  private readonly store = inject(NotificationStore);
  private readonly authStore = inject(AuthStore);
  private readonly pendingIds = signal<ReadonlySet<string>>(new Set());

  isPending(notificationId: string): boolean {
    return this.pendingIds().has(notificationId);
  }

  resolveRoute(notification: AppNotification): string | null {
    if (notification.action_route?.startsWith('/')) {
      return notification.action_route;
    }

    if (!this.isBookingNotification(notification.type)) {
      return null;
    }

    const bookingId = notification.metadata['booking_id'];
    if (typeof bookingId !== 'string' || bookingId.length === 0) {
      return null;
    }

    const currentUser = this.authStore.currentUser();
    const clientId = notification.metadata['client_id'];

    if (currentUser && clientId === currentUser.id) {
      return `/my-bookings/${bookingId}`;
    }

    if (this.targetsProfessional(notification.type)) {
      return `/professional/bookings/${bookingId}`;
    }

    if (this.targetsClient(notification.type)) {
      return `/my-bookings/${bookingId}`;
    }

    return hasProfessionalAccess(currentUser)
      ? `/professional/bookings/${bookingId}`
      : `/my-bookings/${bookingId}`;
  }

  activate(notification: AppNotification, afterActivate?: () => void): void {
    if (this.isPending(notification.id)) return;

    const route = this.resolveRoute(notification);
    if (!route) return;

    if (notification.is_read) {
      this.finishActivation(route, afterActivate);
      return;
    }

    this.pendingIds.update((ids) => new Set([...ids, notification.id]));
    this.store
      .markAsRead(notification.id)
      .pipe(
        finalize(() => {
          this.pendingIds.update((ids) => {
            const next = new Set(ids);
            next.delete(notification.id);
            return next;
          });
        }),
      )
      .subscribe({
        next: () => this.finishActivation(route, afterActivate),
        error: () => undefined,
      });
  }

  private finishActivation(actionRoute: string, afterActivate?: () => void): void {
    afterActivate?.();
    void this.router.navigateByUrl(actionRoute);
  }

  private isBookingNotification(type: string): boolean {
    return type.startsWith('booking.') || type === 'package.session.reserved';
  }

  private targetsProfessional(type: string): boolean {
    return type === 'booking.created' || type === 'booking.cancelled_by_client';
  }

  private targetsClient(type: string): boolean {
    return type === 'booking.confirmed' || type === 'booking.cancelled_by_professional';
  }
}
