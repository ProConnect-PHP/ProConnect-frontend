import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { ApiClient } from '../../http/api.client';
import { NotificationApiService } from './notification-api.service';

describe('NotificationApiService', () => {
  const apiClient = {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.patch.mockReset();
    apiClient.delete.mockReset();

    TestBed.configureTestingModule({
      providers: [
        NotificationApiService,
        { provide: ApiClient, useValue: apiClient },
      ],
    });
  });

  it('builds the notification list and unread count requests', async () => {
    apiClient.get
      .mockReturnValueOnce(
        of({
          data: [],
          links: { first: null, last: null, prev: null, next: null },
          meta: {
            current_page: 2,
            from: null,
            last_page: 2,
            path: '/api/v1/notifications',
            per_page: 10,
            to: null,
            total: 0,
          },
        }),
      )
      .mockReturnValueOnce(of({ count: 4 }));

    const service = TestBed.inject(NotificationApiService);
    await firstValueFrom(
      service.getNotifications({ status: 'archived', page: 2, perPage: 10 }),
    );
    await firstValueFrom(service.getUnreadCount());

    expect(apiClient.get).toHaveBeenNthCalledWith(1, 'notifications', {
      params: {
        status: 'archived',
        page: 2,
        per_page: 10,
      },
    });
    expect(apiClient.get).toHaveBeenNthCalledWith(2, 'notifications/unread-count');
  });

  it('uses the refactored mutation endpoints', async () => {
    const notification = {
      data: {
        id: 'notification-1',
        type: 'booking.created',
        title: 'Nueva reserva',
        message: 'Tenes una nueva reserva.',
        metadata: null,
        is_read: true,
        is_archived: false,
        read_at: '2026-06-14T12:00:00Z',
        archived_at: null,
        created_at: '2026-06-14T11:00:00Z',
        created_date: '2026-06-14',
        created_time: '11:00',
      },
    };

    apiClient.patch
      .mockReturnValueOnce(of(notification))
      .mockReturnValueOnce(of({ message: 'All notifications marked as read', updated: 1 }))
      .mockReturnValueOnce(
        of({
          data: {
            ...notification.data,
            is_archived: true,
            archived_at: '2026-06-14T12:30:00Z',
          },
        }),
      )
      .mockReturnValueOnce(
        of({
          data: {
            ...notification.data,
            is_archived: false,
            archived_at: null,
          },
        }),
      );
    apiClient.delete.mockReturnValue(of({ message: 'Notification deleted' }));

    const service = TestBed.inject(NotificationApiService);
    await firstValueFrom(service.markAsRead('notification-1'));
    await firstValueFrom(service.markAllAsRead());
    await firstValueFrom(service.archive('notification-1'));
    await firstValueFrom(service.unarchive('notification-1'));
    await firstValueFrom(service.delete('notification-1'));

    expect(apiClient.patch).toHaveBeenNthCalledWith(
      1,
      'notifications/notification-1/read',
      {},
    );
    expect(apiClient.patch).toHaveBeenNthCalledWith(2, 'notifications/read-all', {});
    expect(apiClient.patch).toHaveBeenNthCalledWith(
      3,
      'notifications/notification-1/archive',
      {},
    );
    expect(apiClient.patch).toHaveBeenNthCalledWith(
      4,
      'notifications/notification-1/unarchive',
      {},
    );
    expect(apiClient.delete).toHaveBeenCalledWith('notifications/notification-1');
  });
});
