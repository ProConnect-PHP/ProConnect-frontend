import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { AdminMetrics } from '../models/admin-metrics.model';
import { AdminApiService, readNumber, readRecord } from './admin-api.service';

@Injectable({ providedIn: 'root' })
export class AdminMetricsService {
  private readonly adminApi = inject(AdminApiService);

  getMetrics(): Observable<AdminMetrics> {
    return this.adminApi
      .getData<unknown>('metrics')
      .pipe(map((response) => mapAdminMetrics(response)));
  }
}

function mapAdminMetrics(value: unknown): AdminMetrics {
  const record = readRecord(value);

  return {
    users_total: readNumber(record['users_total']),
    clients_total: readNumber(record['clients_total']),
    professionals_total: readNumber(record['professionals_total']),
    admins_total: readNumber(record['admins_total']),
    bookings_total: readNumber(record['bookings_total']),
    bookings_today: readNumber(record['bookings_today']),
    services_total: readNumber(record['services_total']),
    reviews_total: optionalNumber(record['reviews_total']),
    packages_total: optionalNumber(record['packages_total']),
    payments_total: optionalNumber(record['payments_total']),
  };
}

function optionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  return readNumber(value);
}
