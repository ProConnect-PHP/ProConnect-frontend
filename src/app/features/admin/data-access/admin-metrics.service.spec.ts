import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { AdminApiService } from './admin-api.service';
import { AdminMetricsService } from './admin-metrics.service';

describe('AdminMetricsService', () => {
  const adminApi = {
    getData: vi.fn(),
  };

  beforeEach(() => {
    adminApi.getData.mockReset();

    TestBed.configureTestingModule({
      providers: [
        AdminMetricsService,
        { provide: AdminApiService, useValue: adminApi },
      ],
    });
  });

  it('loads and normalizes admin metrics', async () => {
    adminApi.getData.mockReturnValue(
      of({
        users_total: '12',
        clients_total: 8,
        professionals_total: '3',
        admins_total: '1',
        bookings_total: '20',
        bookings_today: '2',
        services_total: '9',
        reviews_total: '4',
      }),
    );

    const service = TestBed.inject(AdminMetricsService);
    const metrics = await firstValueFrom(service.getMetrics());

    expect(adminApi.getData).toHaveBeenCalledWith('metrics');
    expect(metrics).toEqual({
      users_total: 12,
      clients_total: 8,
      professionals_total: 3,
      admins_total: 1,
      bookings_total: 20,
      bookings_today: 2,
      services_total: 9,
      reviews_total: 4,
      packages_total: undefined,
      payments_total: undefined,
    });
  });
});
