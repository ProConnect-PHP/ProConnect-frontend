export interface ActivityLog {
  id: string;
  event: string;
  severity?: string;
  actor_id?: string | null;
  actor_email?: string | null;
  actor_role?: string | null;
  acting_as?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  method?: string | null;
  path?: string | null;
  status_code?: number | null;
  ip?: string | null;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityLogFilters {
  event?: string;
  severity?: string;
  actor_role?: string;
  acting_as?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}
