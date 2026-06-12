import { Injectable, inject, signal } from '@angular/core';
import { ApiClient } from '../../http/api.client';

export interface NotificationItem {
  id: string;
  recipient_id: string;
  type: string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationStore {

  private hasLoadedUnreadCount = false;
  private readonly api = inject(ApiClient);
  readonly currentPage = signal<number>(1);
  readonly lastPage = signal<number>(1);
  readonly total = signal<number>(0);

  readonly unreadCount = signal<number>(0);
  readonly notifications = signal<NotificationItem[]>([]);
  readonly isPanelOpen = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);

  loadUnreadCount(): void {
    if (this.hasLoadedUnreadCount) return;

    this.api.get<{ count: number }>(`notifications/unread-count`)
      .subscribe({
        next: ({ count }) => {
          this.unreadCount.set(count);
          this.hasLoadedUnreadCount = true;
        },
        error: () => this.unreadCount.set(0),
      });
  }

  increment(): void {
    this.unreadCount.update(n => n + 1);
  }

  togglePanel(): void {
    this.isPanelOpen.update(open => !open);
    if (this.isPanelOpen()) {
      this.loadNotifications();
      this.markAllRead(); // Dejarlo aquí permite el usuario sepa cuales fueron las nuevas notis
    }
  }

  loadNotifications(page: number = 1): void {
    this.isLoading.set(true);
    this.api
      .get<PaginatedResponse<NotificationItem>>(`notifications?page=${page}`)
      .subscribe({
        next: (res) => {
          this.notifications.set(res.data);
          this.currentPage.set(res.current_page);
          this.lastPage.set(res.last_page);
          this.total.set(res.total);
          this.isLoading.set(false);
        },
        error: () => {
          this.notifications.set([]);
          this.isLoading.set(false);
        },
      });
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
  }

  markAllRead(): void {
    this.api
      .post(`notifications/mark-all-read`, {})
      .subscribe({
        next: () => this.unreadCount.set(0),
        error: () => {},
      });
  }

  deleteNotification(id: string): void {
    this.notifications.update(list => list.filter(n => n.id !== id));

    this.api
      .delete(`notifications/${id}`)
      .subscribe({
        error: () => this.loadNotifications(), // si falla, recargamos para revertir
      });
  }

  deleteAll(): void {
    const previous = this.notifications();
    this.notifications.set([]);
    this.unreadCount.set(0);

    this.api
      .delete(`notifications/delete-all`)
      .subscribe({
        error: () => this.notifications.set(previous),
      });
  }
}