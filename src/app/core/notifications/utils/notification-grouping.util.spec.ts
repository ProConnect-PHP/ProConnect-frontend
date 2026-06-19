import { AppNotification } from '../models/notification.models';
import { groupNotificationsByDay } from './notification-grouping.util';

describe('notification grouping', () => {
  it('groups by local day and sorts newest notifications first', () => {
    const now = new Date(2026, 5, 14, 12, 0, 0);
    const notifications: AppNotification[] = [
      createNotification('older-today', new Date(2026, 5, 14, 9, 0, 0)),
      createNotification('yesterday', new Date(2026, 5, 13, 21, 30, 0)),
      createNotification('newer-today', new Date(2026, 5, 14, 11, 0, 0)),
    ];

    const groups = groupNotificationsByDay(notifications, now);

    expect(groups.map((group) => group.label)).toEqual(['Hoy', 'Ayer']);
    expect(groups[0]?.items.map((item) => item.id)).toEqual([
      'newer-today',
      'older-today',
    ]);
    expect(groups[1]?.items.map((item) => item.id)).toEqual(['yesterday']);
  });
});

function createNotification(id: string, createdAt: Date): AppNotification {
  return {
    id,
    type: 'booking.created',
    title: id,
    message: 'Mensaje',
    action_route: null,
    metadata: {},
    is_read: false,
    is_archived: false,
    read_at: null,
    archived_at: null,
    created_at: createdAt.toISOString(),
    created_date: '',
    created_time: '',
  };
}
