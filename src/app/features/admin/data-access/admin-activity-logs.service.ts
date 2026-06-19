import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ActivityLog, ActivityLogFilters } from '../models/activity-log.model';
import { AdminPaginatedResponse } from '../models/admin-pagination.model';
import {
  AdminApiService,
  readNullableNumber,
  readNullableRecord,
  readNullableString,
  readRecord,
  readString,
} from './admin-api.service';

@Injectable({ providedIn: 'root' })
export class AdminActivityLogsService {
  private readonly adminApi = inject(AdminApiService);

  getLogs(filters: ActivityLogFilters = {}): Observable<AdminPaginatedResponse<ActivityLog>> {
    return this.adminApi.getCollection<ActivityLog>(
      'activity-logs',
      cleanLogFilters(filters),
      mapActivityLog,
      'activity_logs',
    );
  }
}

export function mapActivityLog(value: unknown): ActivityLog {
  const record = readRecord(value);

  return {
    id: readString(record['id']),
    event: readString(record['event']) || 'Evento',
    severity: readNullableString(record['severity']) ?? undefined,
    actor_id: readNullableString(record['actor_id']),
    actor_email: readNullableString(record['actor_email']),
    actor_role: readNullableString(record['actor_role']),
    acting_as: readNullableString(record['acting_as']),
    entity_type: readNullableString(record['entity_type']),
    entity_id: readNullableString(record['entity_id']),
    method: readNullableString(record['method']),
    path: readNullableString(record['path']),
    status_code: readNullableNumber(record['status_code']),
    ip: readNullableString(record['ip']),
    created_at: readString(record['created_at']),
    metadata: readNullableRecord(record['metadata']),
  };
}

function cleanLogFilters(filters: ActivityLogFilters): Record<string, string | number | undefined> {
  return {
    event: filters.event?.trim() || undefined,
    severity: filters.severity?.trim() || undefined,
    actor_role: filters.actor_role?.trim() || undefined,
    acting_as: filters.acting_as?.trim() || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    page: filters.page,
    per_page: filters.per_page,
  };
}
