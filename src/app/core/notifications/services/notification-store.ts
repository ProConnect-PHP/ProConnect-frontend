import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap, throwError } from 'rxjs';

import { ApiClientError } from '../../http/models/api-error.model';
import { NotificationApiService } from '../data-access/notification-api.service';
import { mapNotification } from '../data-access/notification.mapper';
import {
  AppNotification,
  NotificationStatus,
} from '../models/notification.models';
import { groupNotificationsByDay } from '../utils/notification-grouping.util';
import { NotificationToastService } from './notification-toast.service';

const defaultPerPage = 20;
const panelPerPage = 5;

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly api = inject(NotificationApiService);
  private readonly toast = inject(NotificationToastService);
  private hasLoadedUnreadCount = false;
  private hasLoadedPanelNotifications = false;
  private pageLoadVersion = 0;

  readonly notifications = signal<AppNotification[]>([]);
  readonly panelNotifications = signal<AppNotification[]>([]);
  readonly selectedStatus = signal<NotificationStatus>('active');
  readonly unreadCount = signal(0);
  readonly loading = signal(false);
  readonly loadingMore = signal(false);
  readonly panelLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly panelError = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly lastPage = signal(1);
  readonly total = signal(0);
  readonly isPanelOpen = signal(false);
  readonly pendingReadIds = signal<ReadonlySet<string>>(new Set());
  readonly pendingArchiveIds = signal<ReadonlySet<string>>(new Set());
  readonly pendingUnarchiveIds = signal<ReadonlySet<string>>(new Set());
  readonly markingAllAsRead = signal(false);

  readonly groups = computed(() => groupNotificationsByDay(this.notifications()));
  readonly hasMore = computed(() => this.currentPage() < this.lastPage());

  loadUnreadCount(force = false): void {
    if (this.hasLoadedUnreadCount && !force) return;

    this.api.getUnreadCount().subscribe({
      next: ({ count }) => {
        this.unreadCount.set(Math.max(0, count));
        this.hasLoadedUnreadCount = true;
      },
      error: (error: unknown) => {
        if (!this.hasLoadedUnreadCount) this.unreadCount.set(0);
        this.handleError(error, 'No pudimos actualizar el contador de notificaciones.', false);
      },
    });
  }

  selectStatus(status: NotificationStatus): void {
    if (this.selectedStatus() === status && this.notifications().length > 0) return;

    this.selectedStatus.set(status);
    this.loadFirstPage();
  }

  loadFirstPage(): void {
    const loadVersion = ++this.pageLoadVersion;
    this.loading.set(true);
    this.error.set(null);
    const status = this.selectedStatus();

    this.api
      .getNotifications({ status, page: 1, perPage: defaultPerPage })
      .pipe(
        finalize(() => {
          if (this.pageLoadVersion === loadVersion) this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          if (this.pageLoadVersion !== loadVersion || this.selectedStatus() !== status) return;

          this.notifications.set(sortAndDedupe(response.data));
          this.currentPage.set(response.meta.current_page);
          this.lastPage.set(response.meta.last_page);
          this.total.set(response.meta.total);

          if (status === 'active') {
            this.panelNotifications.set(response.data.slice(0, panelPerPage));
            this.hasLoadedPanelNotifications = true;
          }
        },
        error: (error: unknown) => {
          if (this.pageLoadVersion !== loadVersion || this.selectedStatus() !== status) return;
          this.handleError(error, 'No pudimos cargar tus notificaciones.');
        },
      });
  }

  loadMore(): void {
    if (!this.hasMore() || this.loadingMore()) return;

    this.loadingMore.set(true);
    this.error.set(null);
    const nextPage = this.currentPage() + 1;
    const status = this.selectedStatus();

    this.api
      .getNotifications({ status, page: nextPage, perPage: defaultPerPage })
      .pipe(finalize(() => this.loadingMore.set(false)))
      .subscribe({
        next: (response) => {
          if (this.selectedStatus() !== status) return;

          this.notifications.update((current) =>
            sortAndDedupe([...current, ...response.data]),
          );
          this.currentPage.set(response.meta.current_page);
          this.lastPage.set(response.meta.last_page);
          this.total.set(response.meta.total);
        },
        error: (error: unknown) => {
          if (this.selectedStatus() !== status) return;
          this.handleError(error, 'No pudimos cargar mas notificaciones.');
        },
      });
  }

  ensurePanelNotificationsLoaded(): void {
    if (this.hasLoadedPanelNotifications || this.panelLoading()) return;

    this.panelLoading.set(true);
    this.panelError.set(null);

    this.api
      .getNotifications({ status: 'active', page: 1, perPage: panelPerPage })
      .pipe(finalize(() => this.panelLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.panelNotifications.set(response.data.slice(0, panelPerPage));
          this.hasLoadedPanelNotifications = true;
        },
        error: (error: unknown) => {
          this.panelError.set(this.errorMessage(error, 'No pudimos cargar tus notificaciones.'));
        },
      });
  }

  markAsRead(notificationId: string): Observable<AppNotification | null> {
    const current = this.findNotification(notificationId);
    if (current?.is_read) return of(current);
    if (this.pendingReadIds().has(notificationId)) return of(current ?? null);

    this.addPendingId(this.pendingReadIds, notificationId);

    return this.api.markAsRead(notificationId).pipe(
      tap((notification) => this.applyReadNotification(notification)),
      catchError((error: unknown) => {
        this.handleMutationError(
          error,
          notificationId,
          'No pudimos marcar la notificacion como leida.',
        );
        return throwError(() => error);
      }),
      finalize(() => this.removePendingId(this.pendingReadIds, notificationId)),
    );
  }

  markAllAsRead(): void {
    if (this.markingAllAsRead() || this.unreadCount() === 0) return;

    this.markingAllAsRead.set(true);
    this.error.set(null);

    this.api
      .markAllAsRead()
      .pipe(finalize(() => this.markingAllAsRead.set(false)))
      .subscribe({
        next: () => {
          const readAt = new Date().toISOString();
          this.notifications.update((items) =>
            items.map((item) =>
              item.is_archived || item.is_read
                ? item
                : { ...item, is_read: true, read_at: readAt },
            ),
          );
          this.panelNotifications.update((items) =>
            items.map((item) =>
              item.is_read ? item : { ...item, is_read: true, read_at: readAt },
            ),
          );
          this.unreadCount.set(0);
        },
        error: (error: unknown) => {
          this.handleError(error, 'No pudimos marcar todas las notificaciones como leidas.');
        },
      });
  }

  archive(notificationId: string): void {
    if (this.pendingArchiveIds().has(notificationId)) return;

    this.addPendingId(this.pendingArchiveIds, notificationId);
    this.error.set(null);

    this.api
      .archive(notificationId)
      .pipe(finalize(() => this.removePendingId(this.pendingArchiveIds, notificationId)))
      .subscribe({
        next: (notification) => this.applyArchivedNotification(notification),
        error: (error: unknown) =>
          this.handleMutationError(
            error,
            notificationId,
            'No pudimos archivar la notificacion.',
          ),
      });
  }

  unarchive(notificationId: string): void {
    if (this.pendingUnarchiveIds().has(notificationId)) return;

    this.addPendingId(this.pendingUnarchiveIds, notificationId);
    this.error.set(null);

    this.api
      .unarchive(notificationId)
      .pipe(finalize(() => this.removePendingId(this.pendingUnarchiveIds, notificationId)))
      .subscribe({
        next: (notification) => this.applyUnarchivedNotification(notification),
        error: (error: unknown) =>
          this.handleMutationError(
            error,
            notificationId,
            'No pudimos desarchivar la notificacion.',
          ),
      });
  }

  deletePermanently(notificationId: string): Observable<void> {
    return this.api.delete(notificationId).pipe(
      tap(() => this.removeNotificationEverywhere(notificationId)),
      catchError((error: unknown) => {
        this.handleMutationError(
          error,
          notificationId,
          'No pudimos eliminar la notificacion.',
        );
        return throwError(() => error);
      }),
      map(() => undefined),
    );
  }

  receiveRealtime(payload: unknown): AppNotification | null {
    const notification = mapNotification(payload);
    if (!notification || notification.is_archived) return null;

    const existing = this.findNotification(notification.id);
    const shouldIncrement = !notification.is_read && (!existing || existing.is_read);

    this.panelNotifications.update((items) =>
      sortAndDedupe([notification, ...items]).slice(0, panelPerPage),
    );
    this.hasLoadedPanelNotifications = true;

    if (this.selectedStatus() !== 'archived') {
      this.notifications.update((items) => sortAndDedupe([notification, ...items]));
      this.total.update((total) => (existing ? total : total + 1));
    }

    if (shouldIncrement) {
      this.unreadCount.update((count) => count + 1);
    }

    return notification;
  }

  togglePanel(): void {
    const willOpen = !this.isPanelOpen();
    this.isPanelOpen.set(willOpen);
    if (willOpen) this.ensurePanelNotificationsLoaded();
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
  }

  clearError(): void {
    this.error.set(null);
  }

  reset(): void {
    this.notifications.set([]);
    this.panelNotifications.set([]);
    this.selectedStatus.set('active');
    this.unreadCount.set(0);
    this.loading.set(false);
    this.loadingMore.set(false);
    this.panelLoading.set(false);
    this.error.set(null);
    this.panelError.set(null);
    this.currentPage.set(1);
    this.lastPage.set(1);
    this.total.set(0);
    this.isPanelOpen.set(false);
    this.pendingReadIds.set(new Set());
    this.pendingArchiveIds.set(new Set());
    this.pendingUnarchiveIds.set(new Set());
    this.markingAllAsRead.set(false);
    this.hasLoadedUnreadCount = false;
    this.hasLoadedPanelNotifications = false;
    this.pageLoadVersion++;
  }

  private applyReadNotification(notification: AppNotification): void {
    const previous = this.findNotification(notification.id);
    this.replaceNotification(this.notifications, notification);
    this.replaceNotification(this.panelNotifications, notification);

    if (previous && !previous.is_read && notification.is_read && !previous.is_archived) {
      this.unreadCount.update((count) => Math.max(0, count - 1));
    }
  }

  private applyArchivedNotification(notification: AppNotification): void {
    const previous = this.findNotification(notification.id);
    this.panelNotifications.update((items) =>
      items.filter((item) => item.id !== notification.id),
    );

    if (this.selectedStatus() === 'all') {
      this.replaceNotification(this.notifications, notification);
    } else {
      this.removeFromPage(notification.id);
    }

    if (previous && !previous.is_read && !previous.is_archived) {
      this.unreadCount.update((count) => Math.max(0, count - 1));
    }
  }

  private applyUnarchivedNotification(notification: AppNotification): void {
    const previous = this.findNotification(notification.id);
    this.panelNotifications.update((items) =>
      sortAndDedupe([notification, ...items]).slice(0, panelPerPage),
    );

    if (this.selectedStatus() === 'all') {
      this.replaceNotification(this.notifications, notification);
    } else if (this.selectedStatus() === 'archived') {
      this.removeFromPage(notification.id);
    } else {
      this.notifications.update((items) => sortAndDedupe([notification, ...items]));
    }

    if (previous?.is_archived && !notification.is_read) {
      this.unreadCount.update((count) => count + 1);
    }
  }

  private removeFromPage(notificationId: string): void {
    const exists = this.notifications().some((item) => item.id === notificationId);
    this.notifications.update((items) => items.filter((item) => item.id !== notificationId));
    if (exists) this.total.update((total) => Math.max(0, total - 1));
  }

  private removeNotificationEverywhere(notificationId: string): void {
    const current = this.findNotification(notificationId);
    this.removeFromPage(notificationId);
    this.panelNotifications.update((items) =>
      items.filter((item) => item.id !== notificationId),
    );

    if (current && !current.is_read && !current.is_archived) {
      this.unreadCount.update((count) => Math.max(0, count - 1));
    }
  }

  private handleMutationError(error: unknown, notificationId: string, fallback: string): void {
    if (error instanceof ApiClientError && error.status === 404) {
      this.removeNotificationEverywhere(notificationId);
      this.toast.show('La notificacion ya no esta disponible.', 'info');
      return;
    }

    this.handleError(error, fallback);
  }

  private handleError(error: unknown, fallback: string, showToast = true): void {
    const message = this.errorMessage(error, fallback);
    this.error.set(message);
    if (showToast) this.toast.show(message, 'error');
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof ApiClientError)) return fallback;
    if (error.status === 403) return 'No tenes permisos para modificar esta notificacion.';
    return error.message || fallback;
  }

  private findNotification(notificationId: string): AppNotification | undefined {
    return (
      this.notifications().find((item) => item.id === notificationId) ??
      this.panelNotifications().find((item) => item.id === notificationId)
    );
  }

  private replaceNotification(
    target: typeof this.notifications,
    notification: AppNotification,
  ): void {
    target.update((items) =>
      items.map((item) => (item.id === notification.id ? notification : item)),
    );
  }

  private addPendingId(target: typeof this.pendingReadIds, id: string): void {
    target.update((ids) => new Set([...ids, id]));
  }

  private removePendingId(target: typeof this.pendingReadIds, id: string): void {
    target.update((ids) => {
      const next = new Set(ids);
      next.delete(id);
      return next;
    });
  }
}

function sortAndDedupe(items: AppNotification[]): AppNotification[] {
  const byId = new Map<string, AppNotification>();

  for (const item of items) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }

  return Array.from(byId.values()).sort(
    (left, right) =>
      safeTimestamp(right.created_at) - safeTimestamp(left.created_at) ||
      right.id.localeCompare(left.id),
  );
}

function safeTimestamp(value: string): number {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}
