import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiClient } from '../../http/api.client';
import {
  AppNotification,
  DeleteNotificationResponse,
  MarkAllNotificationsReadResponse,
  NotificationListParams,
  PaginatedNotificationsResponse,
  UnreadNotificationCountResponse,
} from '../models/notification.models';
import {
  unwrapNotificationResponse,
  unwrapPaginatedNotificationsResponse,
} from './notification.mapper';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly api = inject(ApiClient);

  getNotifications(
    params: NotificationListParams = {},
  ): Observable<PaginatedNotificationsResponse> {
    return this.api
      .get<unknown>('notifications', {
        params: {
          status: params.status,
          page: params.page,
          per_page: params.perPage,
        },
      })
      .pipe(map((response) => unwrapPaginatedNotificationsResponse(response)));
  }

  getUnreadCount(): Observable<UnreadNotificationCountResponse> {
    return this.api.get<UnreadNotificationCountResponse>('notifications/unread-count');
  }

  markAsRead(notificationId: string): Observable<AppNotification> {
    return this.api
      .patch<unknown, Record<string, never>>(`notifications/${notificationId}/read`, {})
      .pipe(map((response) => unwrapNotificationResponse(response)));
  }

  markAllAsRead(): Observable<MarkAllNotificationsReadResponse> {
    return this.api.patch<MarkAllNotificationsReadResponse, Record<string, never>>(
      'notifications/read-all',
      {},
    );
  }

  archive(notificationId: string): Observable<AppNotification> {
    return this.api
      .patch<unknown, Record<string, never>>(`notifications/${notificationId}/archive`, {})
      .pipe(map((response) => unwrapNotificationResponse(response)));
  }

  unarchive(notificationId: string): Observable<AppNotification> {
    return this.api
      .patch<unknown, Record<string, never>>(`notifications/${notificationId}/unarchive`, {})
      .pipe(map((response) => unwrapNotificationResponse(response)));
  }

  delete(notificationId: string): Observable<DeleteNotificationResponse> {
    return this.api.delete<DeleteNotificationResponse>(`notifications/${notificationId}`);
  }
}
