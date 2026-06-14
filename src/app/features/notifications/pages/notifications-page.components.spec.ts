import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AppNotification } from '../../../core/notifications/models/notification.models';
import { NotificationNavigationService } from '../../../core/notifications/services/notification-navigation.service';
import { NotificationStore } from '../../../core/notifications/services/notification-store';
import { NotificationsPageComponent } from './notifications-page.components';

describe('NotificationsPageComponent', () => {
  const notification: AppNotification = {
    id: 'notification-1',
    type: 'booking.created',
    title: 'Nueva reserva recibida',
    message: 'Juan reservo una sesion.',
    action_route: '/professional/bookings/booking-1',
    metadata: {},
    is_read: false,
    is_archived: false,
    read_at: null,
    archived_at: null,
    created_at: '2026-06-14T18:20:00Z',
    created_date: '2026-06-14',
    created_time: '18:20',
  };
  const store = {
    notifications: signal([notification]),
    groups: signal([{ date: '2026-06-14', label: 'Hoy', items: [notification] }]),
    selectedStatus: signal<'all' | 'active' | 'archived'>('active'),
    unreadCount: signal(1),
    loading: signal(false),
    loadingMore: signal(false),
    error: signal<string | null>(null),
    total: signal(1),
    hasMore: signal(false),
    markingAllAsRead: signal(false),
    pendingReadIds: signal<ReadonlySet<string>>(new Set()),
    pendingArchiveIds: signal<ReadonlySet<string>>(new Set()),
    pendingUnarchiveIds: signal<ReadonlySet<string>>(new Set()),
    loadFirstPage: vi.fn(),
    loadMore: vi.fn(),
    selectStatus: vi.fn(),
    markAllAsRead: vi.fn(),
    markAsRead: vi.fn(),
    archive: vi.fn(),
    unarchive: vi.fn(),
  };
  const navigation = {
    isPending: vi.fn(() => false),
    resolveRoute: vi.fn((item: AppNotification) => item.action_route),
    activate: vi.fn(),
  };

  beforeEach(async () => {
    store.notifications.set([notification]);
    store.groups.set([{ date: '2026-06-14', label: 'Hoy', items: [notification] }]);
    store.selectedStatus.set('active');
    store.unreadCount.set(1);
    store.loadFirstPage.mockReset();
    store.selectStatus.mockReset();
    store.archive.mockReset();
    store.unarchive.mockReset();
    navigation.isPending.mockClear();
    navigation.resolveRoute.mockClear();
    navigation.activate.mockReset();

    await TestBed.configureTestingModule({
      imports: [NotificationsPageComponent],
      providers: [
        { provide: NotificationStore, useValue: store },
        { provide: NotificationNavigationService, useValue: navigation },
      ],
    }).compileComponents();
  });

  it('renders notifications grouped by day', () => {
    const fixture = TestBed.createComponent(NotificationsPageComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(store.loadFirstPage).toHaveBeenCalledOnce();
    expect(host.textContent).toContain('Hoy');
    expect(host.textContent).toContain('Todas');
    expect(host.textContent).toContain('Activas');
    expect(host.textContent).toContain('Archivadas');
    expect(host.textContent).toContain('Nueva reserva recibida');
    expect(host.textContent).toContain('Juan reservo una sesion.');
  });

  it('shows the archived badge and unarchive action for archived notifications', () => {
    store.selectedStatus.set('archived');
    store.notifications.set([
      {
        ...notification,
        is_archived: true,
        archived_at: '2026-06-14T19:00:00Z',
      },
    ]);
    store.groups.set([
      {
        date: '2026-06-14',
        label: 'Hoy',
        items: store.notifications(),
      },
    ]);

    const fixture = TestBed.createComponent(NotificationsPageComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Archivada');
    expect(host.textContent).toContain('Desarchivar');
  });

  it('archives without activating the notification', () => {
    const fixture = TestBed.createComponent(NotificationsPageComponent);
    fixture.detectChanges();
    const archiveButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.trim() === 'Archivar');

    archiveButton?.click();

    expect(store.archive).toHaveBeenCalledWith(notification.id);
    expect(navigation.activate).not.toHaveBeenCalled();
  });
});
