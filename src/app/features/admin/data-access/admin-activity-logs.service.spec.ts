import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { ActivityLog } from '../models/activity-log.model';
import { AdminApiService } from './admin-api.service';
import {
  AdminActivityLogsService,
  mapActivityLog,
} from './admin-activity-logs.service';

const meta = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

describe('AdminActivityLogsService', () => {
  const adminApi = {
    getCollection: vi.fn(),
  };

  beforeEach(() => {
    adminApi.getCollection.mockReset();

    TestBed.configureTestingModule({
      providers: [
        AdminActivityLogsService,
        { provide: AdminApiService, useValue: adminApi },
      ],
    });
  });

  it('requests activity logs with trimmed filters', async () => {
    adminApi.getCollection.mockReturnValue(of({ data: [], meta }));

    const service = TestBed.inject(AdminActivityLogsService);
    await firstValueFrom(
      service.getLogs({
        event: '  login  ',
        severity: ' warning ',
        actor_role: ' admin ',
        acting_as: 'self',
        date_from: '2026-06-01',
        date_to: '2026-06-17',
        page: 3,
        per_page: 50,
      }),
    );

    expect(adminApi.getCollection).toHaveBeenCalledWith(
      'activity-logs',
      {
        event: 'login',
        severity: 'warning',
        actor_role: 'admin',
        acting_as: 'self',
        date_from: '2026-06-01',
        date_to: '2026-06-17',
        page: 3,
        per_page: 50,
      },
      expect.any(Function),
      'activity_logs',
    );
  });

  it('maps flexible activity log records defensively', () => {
    const log: ActivityLog = mapActivityLog({
      id: 5,
      event: '',
      severity: 'warning',
      actor_id: 7,
      actor_email: 'admin@example.com',
      actor_role: 'admin',
      acting_as: 'self',
      entity_type: 'User',
      entity_id: 'user-1',
      method: 'PATCH',
      path: '/api/v1/admin/users/user-1/status',
      status_code: '204',
      ip: '127.0.0.1',
      created_at: '2026-06-17T12:00:00Z',
      metadata: { status: 'disabled' },
    });

    expect(log).toEqual({
      id: '5',
      event: 'Evento',
      severity: 'warning',
      actor_id: '7',
      actor_email: 'admin@example.com',
      actor_role: 'admin',
      acting_as: 'self',
      entity_type: 'User',
      entity_id: 'user-1',
      method: 'PATCH',
      path: '/api/v1/admin/users/user-1/status',
      status_code: 204,
      ip: '127.0.0.1',
      created_at: '2026-06-17T12:00:00Z',
      metadata: { status: 'disabled' },
    });
  });
});
