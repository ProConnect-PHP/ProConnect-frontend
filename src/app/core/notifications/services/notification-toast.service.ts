import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'info' | 'success' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

@Injectable({ providedIn: 'root' })
export class NotificationToastService {

  private _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 0;

  show(message: string, variant: ToastVariant = 'info', durationMs = 4000): void {
    const id = this.nextId++;
    this._toasts.update((toasts) => [...toasts, { id, message, variant }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: number): void {
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
