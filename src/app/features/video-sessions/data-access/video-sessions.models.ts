export type VideoSessionId = string;
export type BookingId = string;
export type UserId = string;
export type ProfessionalProfileId = string;

export type VideoProvider = 'simulator' | 'livekit' | 'external_url';

export type VideoSessionStatus =
  | 'scheduled'
  | 'open'
  | 'in_progress'
  | 'ended'
  | 'cancelled'
  | 'expired';

export interface VideoSessionServiceSummary {
  id: string | number;
  name: string;
  modality: string | null;
}

export interface VideoSessionBookingSummary {
  id: BookingId;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  service_id: string | number | null;
  service?: VideoSessionServiceSummary | null;
}

export interface VideoSessionParticipant {
  id: string;
  video_session_id: VideoSessionId;
  user_id: UserId;
  role: 'client' | 'professional' | string;
  provider_identity: string | null;
  display_name: string | null;
  first_joined_at: string | null;
  last_joined_at: string | null;
  left_at: string | null;
  join_count: number;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
}

export interface VideoSession {
  id: VideoSessionId;
  booking_id: BookingId;
  client_id: UserId;
  professional_id: ProfessionalProfileId;
  provider: VideoProvider;
  status: VideoSessionStatus;
  room_name: string;
  join_url: string | null;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  opened_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  cancelled_at: string | null;
  expired_at: string | null;
  can_join_now: boolean;
  booking?: VideoSessionBookingSummary | null;
  participants?: VideoSessionParticipant[];
  created_at: string | null;
}

export interface VideoSessionJoin {
  video_session_id: VideoSessionId;
  provider: VideoProvider;
  room_name: string;
  join_url: string | null;
  access_token: string | null;
  participant: VideoSessionParticipant;
  expires_at: string | null;
}

export interface VideoSessionsPaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedVideoSessions {
  video_sessions: VideoSession[];
  meta: VideoSessionsPaginationMeta;
}

export type VideoSessionsListParams = {
  page?: number;
  per_page?: number;
};
