import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { NotificationApiService } from '../data-access/notification-api.service';
import {
  AppNotification,
  PaginatedNotificationsResponse,
} from '../models/notification.models';
import { NotificationStore } from './notification-store';
import { NotificationToastService } from './notification-toast.service';

describe('NotificationStore', () => {
  const api = {
    getNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    archive: vi.fn(),
    unarchive: vi.fn(),
    delete: vi.fn(),
  };
  const toast = {
    show: vi.fn(),
  };

  beforeEach(() => {
    Object.values(api).forEach((mock) => mock.mockReset());
    toast.show.mockReset();
    api.getNotifications.mockReturnValue(of(pageResponse([unreadNotification])));
    api.getUnreadCount.mockReturnValue(of({ count: 1 }));
    api.markAsRead.mockReturnValue(of(readNotification));
    api.markAllAsRead.mockReturnValue(
      of({ message: 'All notifications marked as read', updated: 1 }),
    );
    api.archive.mockReturnValue(of(archivedNotification));
    api.unarchive.mockReturnValue(of(unreadNotification));
    api.delete.mockReturnValue(of({ message: 'Notification deleted' }));

    TestBed.configureTestingModule({
      providers: [
        NotificationStore,
        { provide: NotificationApiService, useValue: api },
        { provide: NotificationToastService, useValue: toast },
      ],
    });
  });

  it('loads notifications using the selected status', () => {
    const store = TestBed.inject(NotificationStore);

    store.loadFirstPage();

    expect(api.getNotifications).toHaveBeenCalledWith({
      status: 'active',
      page: 1,
      perPage: 20,
    });
    expect(store.notifications()).toEqual([unreadNotification]);
    expect(store.panelNotifications()).toEqual([unreadNotification]);
    expect(store.total()).toBe(1);
  });

  it('reloads the first page when the selected status changes', () => {
    const store = TestBed.inject(NotificationStore);
    api.getNotifications.mockReturnValue(of(pageResponse([archivedNotification])));

    store.selectStatus('archived');

    expect(store.selectedStatus()).toBe('archived');
    expect(api.getNotifications).toHaveBeenCalledWith({
      status: 'archived',
      page: 1,
      perPage: 20,
    });
    expect(store.notifications()).toEqual([archivedNotification]);
  });

  it('marks one notification as read and decrements the active unread count', async () => {
    const store = TestBed.inject(NotificationStore);
    store.loadFirstPage();
    store.loadUnreadCount();

    await firstValueFrom(store.markAsRead(unreadNotification.id));

    expect(store.notifications()[0]?.is_read).toBe(true);
    expect(store.panelNotifications()[0]?.is_read).toBe(true);
    expect(store.unreadCount()).toBe(0);
  });

  it('marks every visible active notification as read', () => {
    const store = TestBed.inject(NotificationStore);
    store.loadFirstPage();
    store.loadUnreadCount();

    store.markAllAsRead();

    expect(api.markAllAsRead).toHaveBeenCalledOnce();
    expect(store.notifications().every((item) => item.is_read)).toBe(true);
    expect(store.panelNotifications().every((item) => item.is_read)).toBe(true);
    expect(store.unreadCount()).toBe(0);
  });

  it('removes an archived notification from the active view', () => {
    const store = TestBed.inject(NotificationStore);
    store.loadFirstPage();
    store.loadUnreadCount();

    store.archive(unreadNotification.id);

    expect(api.archive).toHaveBeenCalledWith(unreadNotification.id);
    expect(store.notifications()).toEqual([]);
    expect(store.panelNotifications()).toEqual([]);
    expect(store.total()).toBe(0);
    expect(store.unreadCount()).toBe(0);
  });

  it('keeps an archived notification visible and updates it in the all view', () => {
    const store = TestBed.inject(NotificationStore);
    store.selectStatus('all');
    store.loadUnreadCount();

    store.archive(unreadNotification.id);

    expect(store.notifications()).toEqual([archivedNotification]);
    expect(store.total()).toBe(1);
    expect(store.unreadCount()).toBe(0);
  });

  it('removes an unarchived notification from the archived view', () => {
    const store = TestBed.inject(NotificationStore);
    api.getNotifications.mockReturnValue(of(pageResponse([archivedNotification])));
    store.selectStatus('archived');
    store.loadUnreadCount();

    store.unarchive(archivedNotification.id);

    expect(api.unarchive).toHaveBeenCalledWith(archivedNotification.id);
    expect(store.notifications()).toEqual([]);
    expect(store.panelNotifications()).toEqual([unreadNotification]);
    expect(store.total()).toBe(0);
    expect(store.unreadCount()).toBe(2);
  });

  it('updates an unarchived notification in the all view', () => {
    const store = TestBed.inject(NotificationStore);
    api.getNotifications.mockReturnValue(of(pageResponse([archivedNotification])));
    store.selectStatus('all');
    store.loadUnreadCount();

    store.unarchive(archivedNotification.id);

    expect(store.notifications()).toEqual([unreadNotification]);
    expect(store.total()).toBe(1);
    expect(store.unreadCount()).toBe(2);
  });

  it('keeps realtime notifications out of the archived page while updating the bell', () => {
    const store = TestBed.inject(NotificationStore);
    api.getNotifications.mockReturnValue(of(pageResponse([archivedNotification])));
    store.selectStatus('archived');
    store.loadUnreadCount();
    const realtime = {
      ...unreadNotification,
      id: 'notification-realtime',
      title: 'Reserva recibida en vivo',
    };

    store.receiveRealtime(realtime);
    store.receiveRealtime(realtime);

    expect(store.notifications()).toEqual([archivedNotification]);
    expect(store.panelNotifications().map((item) => item.id)).toEqual([
      'notification-realtime',
    ]);
    expect(store.unreadCount()).toBe(2);
  });
});

const unreadNotification: AppNotification = {
  id: 'notification-1',
  type: 'booking.created',
  title: 'Nueva reserva',
  message: 'Juan reservo una sesion.',
  action_route: '/professional/bookings/booking-1',
  metadata: { booking_id: 'booking-1' },
  is_read: false,
  is_archived: false,
  read_at: null,
  archived_at: null,
  created_at: '2026-06-14T11:00:00Z',
  created_date: '2026-06-14',
  created_time: '11:00',
};

const readNotification: AppNotification = {
  ...unreadNotification,
  is_read: true,
  read_at: '2026-06-14T12:00:00Z',
};

const archivedNotification: AppNotification = {
  ...unreadNotification,
  is_archived: true,
  archived_at: '2026-06-14T12:30:00Z',
};

function pageResponse(data: AppNotification[]): PaginatedNotificationsResponse {
  return {
    data,
    links: {
      first: null,
      last: null,
      prev: null,
      next: null,
    },
    meta: {
      current_page: 1,
      from: data.length ? 1 : null,
      last_page: 1,
      path: '/api/v1/notifications',
      per_page: 20,
      to: data.length || null,
      total: data.length,
    },
  };
}
