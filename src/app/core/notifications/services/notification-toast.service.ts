import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationToastService {

  private _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 0;

  show(message: string, durationMs = 4000): void {
    const id = this.nextId++;
    this._toasts.update(ts => [...ts, { id, message }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: number): void {
    this._toasts.update(ts => ts.filter(t => t.id !== id));
  }
}