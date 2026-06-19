export interface AdminPaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface AdminPaginatedResponse<T> {
  data: T[];
  meta: AdminPaginationMeta;
}
