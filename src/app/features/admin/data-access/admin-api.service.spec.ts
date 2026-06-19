import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import { AdminApiService } from './admin-api.service';

describe('AdminApiService', () => {
  const apiClient = {
    get: vi.fn(),
    patch: vi.fn(),
  };

  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.patch.mockReset();

    TestBed.configureTestingModule({
      providers: [
        AdminApiService,
        { provide: ApiClient, useValue: apiClient },
      ],
    });
  });

  it('requests admin resources under the admin prefix and unwraps data', async () => {
    apiClient.get.mockReturnValue(of({ data: { users_total: '7' } }));

    const service = TestBed.inject(AdminApiService);
    const result = await firstValueFrom(
      service.getData<{ users_total: string }>('metrics'),
    );

    expect(result).toEqual({ users_total: '7' });
    expect(apiClient.get).toHaveBeenCalledWith('admin/metrics', { params: undefined });
  });

  it('maps paginated admin collections', async () => {
    apiClient.get.mockReturnValue(
      of({
        data: {
          users: [{ id: 'user-1' }],
          meta: {
            current_page: 2,
            per_page: 15,
            total: 31,
            last_page: 3,
          },
        },
      }),
    );

    const service = TestBed.inject(AdminApiService);
    const result = await firstValueFrom(
      service.getCollection(
        'users',
        { page: 2 },
        (value) => ({ id: String((value as { id: string }).id) }),
        'users',
      ),
    );

    expect(result).toEqual({
      data: [{ id: 'user-1' }],
      meta: {
        current_page: 2,
        per_page: 15,
        total: 31,
        last_page: 3,
      },
    });
    expect(apiClient.get).toHaveBeenCalledWith('admin/users', {
      params: { page: 2 },
    });
  });

  it('patches admin resources and unwraps data', async () => {
    apiClient.patch.mockReturnValue(of({ data: { status: 'disabled' } }));

    const service = TestBed.inject(AdminApiService);
    const result = await firstValueFrom(
      service.patchData('users/user-1/status', { status: 'disabled' }),
    );

    expect(result).toEqual({ status: 'disabled' });
    expect(apiClient.patch).toHaveBeenCalledWith('admin/users/user-1/status', {
      status: 'disabled',
    });
  });
});
