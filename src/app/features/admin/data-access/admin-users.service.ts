import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { AdminPaginatedResponse } from '../models/admin-pagination.model';
import {
  AdminUser,
  AdminUsersFilters,
  AdminUserRole,
  AdminUserStatus,
} from '../models/admin-user.model';
import {
  AdminApiService,
  readNullableString,
  readRecord,
  readString,
} from './admin-api.service';

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly adminApi = inject(AdminApiService);

  getUsers(filters: AdminUsersFilters = {}): Observable<AdminPaginatedResponse<AdminUser>> {
    return this.adminApi.getCollection(
      'users',
      cleanUserFilters(filters),
      mapAdminUser,
      'users',
    );
  }

  getUser(id: string): Observable<AdminUser> {
    return this.adminApi
      .getData<unknown>(`users/${id}`)
      .pipe(map((response) => mapAdminUser(unwrapUser(response))));
  }

  updateUserStatus(id: string, status: AdminUserStatus): Observable<AdminUser> {
    return this.adminApi
      .patchData<unknown, { status: AdminUserStatus }>(`users/${id}/status`, { status })
      .pipe(map((response) => mapAdminUser(unwrapUser(response))));
  }
}

export function mapAdminUser(value: unknown): AdminUser {
  const record = readRecord(value);

  return {
    id: readString(record['id']),
    name: readString(record['name']) || 'Usuario sin nombre',
    email: readString(record['email']),
    role: readRole(record['role']),
    status: readStatus(record['status']),
    created_at: readString(record['created_at']),
    updated_at: readNullableString(record['updated_at']) ?? undefined,
  };
}

function cleanUserFilters(filters: AdminUsersFilters): Record<string, string | number | undefined> {
  return {
    search: filters.search?.trim() || undefined,
    role: filters.role || undefined,
    status: filters.status || undefined,
    page: filters.page,
    per_page: filters.per_page,
  };
}

function unwrapUser(response: unknown): unknown {
  const record = readRecord(response);
  return record['user'] ?? response;
}

function readRole(value: unknown): AdminUserRole {
  const role = readString(value);
  if (role === 'professional' || role === 'admin') return role;
  return 'client';
}

function readStatus(value: unknown): AdminUserStatus {
  return readString(value) === 'disabled' ? 'disabled' : 'active';
}
