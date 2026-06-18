import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { AdminUser } from '../models/admin-user.model';
import { AdminApiService } from './admin-api.service';
import { AdminUsersService } from './admin-users.service';

const meta = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

describe('AdminUsersService', () => {
  const adminApi = {
    getCollection: vi.fn(),
    getData: vi.fn(),
    patchData: vi.fn(),
  };

  beforeEach(() => {
    adminApi.getCollection.mockReset();
    adminApi.getData.mockReset();
    adminApi.patchData.mockReset();

    TestBed.configureTestingModule({
      providers: [
        AdminUsersService,
        { provide: AdminApiService, useValue: adminApi },
      ],
    });
  });

  it('requests users with trimmed filters and maps backend records', async () => {
    adminApi.getCollection.mockReturnValue(of({ data: [], meta }));

    const service = TestBed.inject(AdminUsersService);
    await firstValueFrom(
      service.getUsers({
        search: '  ana  ',
        role: 'admin',
        status: 'active',
        page: 2,
        per_page: 25,
      }),
    );

    expect(adminApi.getCollection).toHaveBeenCalledWith(
      'users',
      {
        search: 'ana',
        role: 'admin',
        status: 'active',
        page: 2,
        per_page: 25,
      },
      expect.any(Function),
      'users',
    );

    const mapper = adminApi.getCollection.mock.calls[0][2] as (value: unknown) => AdminUser;

    expect(
      mapper({
        id: 7,
        name: '',
        email: 'pro@example.com',
        role: 'professional',
        status: 'disabled',
        created_at: '2026-06-17T12:00:00Z',
      }),
    ).toEqual({
      id: '7',
      name: 'Usuario sin nombre',
      email: 'pro@example.com',
      role: 'professional',
      status: 'disabled',
      created_at: '2026-06-17T12:00:00Z',
      updated_at: undefined,
    });
  });

  it('loads one user by id', async () => {
    adminApi.getData.mockReturnValue(
      of({
        user: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          created_at: '2026-06-17T12:00:00Z',
        },
      }),
    );

    const service = TestBed.inject(AdminUsersService);
    const user = await firstValueFrom(service.getUser('user-1'));

    expect(adminApi.getData).toHaveBeenCalledWith('users/user-1');
    expect(user.role).toBe('admin');
    expect(user.status).toBe('active');
  });

  it('updates a user status through the admin mutation endpoint', async () => {
    adminApi.patchData.mockReturnValue(
      of({
        user: {
          id: 'user-1',
          name: 'Client User',
          email: 'client@example.com',
          role: 'client',
          status: 'disabled',
          created_at: '2026-06-17T12:00:00Z',
        },
      }),
    );

    const service = TestBed.inject(AdminUsersService);
    const user = await firstValueFrom(service.updateUserStatus('user-1', 'disabled'));

    expect(adminApi.patchData).toHaveBeenCalledWith('users/user-1/status', {
      status: 'disabled',
    });
    expect(user.status).toBe('disabled');
  });
});
