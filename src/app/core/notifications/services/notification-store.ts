import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class NotificationStore {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // Estado
  readonly unreadCount = signal<number>(0);

  // Llamar al iniciar la app (cuando el usuario está autenticado)
  loadUnreadCount(): void {
    this.http
      .get<{ count: number }>(`${this.baseUrl}/notifications/unread-count`)
      .subscribe({
        next: ({ count }) => this.unreadCount.set(count),
        error: () => this.unreadCount.set(0), // falla silenciosa hasta que el endpoint exista
      });
  }

  // Llamar desde NotificationSocketService al recibir una notificación
  increment(): void {
    this.unreadCount.update(n => n + 1);
  }

  // Llamar cuando el usuario abre el panel
  markAllRead(): void {
    this.http
      .post(`${this.baseUrl}/notifications/mark-all-read`, {})
      .subscribe({
        next: () => this.unreadCount.set(0),
        error: () => {} // silencioso por ahora
      });
  }
}