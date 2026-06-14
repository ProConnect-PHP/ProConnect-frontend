export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_route: string | null;
  metadata: Record<string, unknown>;
  is_read: boolean;
  is_archived: boolean;
  read_at: string | null;
  archived_at: string | null;
  created_at: string;
  created_date: string;
  created_time: string;
}

export interface NotificationPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface NotificationPaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatedNotificationsResponse {
  data: AppNotification[];
  links: NotificationPaginationLinks;
  meta: NotificationPaginationMeta;
}

export interface UnreadNotificationCountResponse {
  count: number;
}

export interface NotificationDayGroup {
  date: string;
  label: string;
  items: AppNotification[];
}

export type NotificationStatus = 'all' | 'active' | 'archived';

export interface NotificationListParams {
  status?: NotificationStatus;
  page?: number;
  perPage?: number;
}

export interface MarkAllNotificationsReadResponse {
  message: string;
  updated: number;
}

export interface DeleteNotificationResponse {
  message: string;
}
