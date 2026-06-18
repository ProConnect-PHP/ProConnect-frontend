export type AdminUserRole = 'client' | 'professional' | 'admin';

export type AdminUserStatus = 'active' | 'disabled';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  created_at: string;
  updated_at?: string;
}

export interface AdminUsersFilters {
  search?: string;
  role?: AdminUserRole | '';
  status?: AdminUserStatus | '';
  page?: number;
  per_page?: number;
}
