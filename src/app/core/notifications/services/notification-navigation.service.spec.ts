import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthStore } from '../../auth/services/auth.store';
import { AppNotification } from '../models/notification.models';
import { NotificationNavigationService } from './notification-navigation.service';
import { NotificationStore } from './notification-store';

describe('NotificationNavigationService', () => {
  const navigateByUrl = vi.fn(async () => true);
  const markAsRead = vi.fn();
  const currentUser = signal({
    id: 'client-1',
    name: 'Cliente',
    email: 'client@example.com',
    role: 'client' as const,
    avatar_url: null,
  });

  beforeEach(() => {
    navigateByUrl.mockClear();
    markAsRead.mockReset();
    markAsRead.mockReturnValue(of({ ...notification, is_read: true }));
    currentUser.set({
      id: 'client-1',
      name: 'Cliente',
      email: 'client@example.com',
      role: 'client',
      avatar_url: null,
    });

    TestBed.configureTestingModule({
      providers: [
        NotificationNavigationService,
        { provide: Router, useValue: { navigateByUrl } },
        { provide: NotificationStore, useValue: { markAsRead } },
        { provide: AuthStore, useValue: { currentUser } },
      ],
    });
  });

  it('respects an explicit client action route and marks an unread notification as read', () => {
    const service = TestBed.inject(NotificationNavigationService);
    const clientRouteNotification = {
      ...notification,
      action_route: '/my-bookings/booking-1',
    };

    service.activate(clientRouteNotification);

    expect(markAsRead).toHaveBeenCalledWith(notification.id);
    expect(navigateByUrl).toHaveBeenCalledWith('/my-bookings/booking-1');
  });

  it('falls back to the client booking detail using metadata', () => {
    const service = TestBed.inject(NotificationNavigationService);

    service.activate(notification);

    expect(navigateByUrl).toHaveBeenCalledWith('/my-bookings/booking-1');
  });

  it('falls back to the professional booking detail in professional context', () => {
    currentUser.set({
      id: 'professional-user-1',
      name: 'Profesional',
      email: 'professional@example.com',
      role: 'professional',
      avatar_url: null,
    });
    const service = TestBed.inject(NotificationNavigationService);

    service.activate({
      ...notification,
      type: 'booking.rescheduled',
      metadata: {
        booking_id: 'booking-1',
        client_id: 'client-1',
      },
    });

    expect(navigateByUrl).toHaveBeenCalledWith('/professional/bookings/booking-1');
  });
});

const notification: AppNotification = {
  id: 'notification-1',
  type: 'booking.confirmed',
  title: 'Reserva confirmada',
  message: 'Tu reserva fue confirmada.',
  action_route: null,
  metadata: {
    booking_id: 'booking-1',
    client_id: 'client-1',
  },
  is_read: false,
  is_archived: false,
  read_at: null,
  archived_at: null,
  created_at: '2026-06-14T18:20:00Z',
  created_date: '2026-06-14',
  created_time: '18:20',
};
