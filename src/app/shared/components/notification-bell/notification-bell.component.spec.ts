import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NotificationStore } from '../../../core/notifications/services/notification-store';
import { NotificationBellComponent } from './notification-bell.component';

describe('NotificationBellComponent', () => {
  const store = {
    unreadCount: signal(7),
    isPanelOpen: signal(false),
    loadUnreadCount: vi.fn(),
    togglePanel: vi.fn(),
    closePanel: vi.fn(),
  };

  beforeEach(async () => {
    store.unreadCount.set(7);
    store.isPanelOpen.set(false);
    store.loadUnreadCount.mockReset();
    store.togglePanel.mockReset();
    store.closePanel.mockReset();

    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [{ provide: NotificationStore, useValue: store }],
    }).compileComponents();
  });

  it('shows the unread count and loads it on init', () => {
    const fixture = TestBed.createComponent(NotificationBellComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(store.loadUnreadCount).toHaveBeenCalledOnce();
    expect(host.textContent).toContain('7');
    expect(host.textContent).toContain('7 notificaciones sin leer');
  });
});
