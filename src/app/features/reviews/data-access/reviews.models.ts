export type ReviewId = string;
export type ReviewReplyId = string;
export type BookingId = string;
export type ServiceId = string | number;
export type ProfessionalProfileId = string;
export type UserId = string;

export interface ReviewClient {
  id: UserId;
  name: string;
  avatar_url: string | null;
}

export interface ReviewReplyProfessional {
  id: ProfessionalProfileId;
  user: {
    id: UserId;
    name: string;
    avatar_url: string | null;
  };
}

export interface ReviewReply {
  id: ReviewReplyId;
  body: string;
  edited_at: string | null;
  professional?: ReviewReplyProfessional;
  created_at: string | null;
}

export interface Review {
  id: ReviewId;
  booking_id: BookingId;
  service_id: ServiceId;
  professional_id: ProfessionalProfileId;
  rating: number;
  comment: string | null;
  comment_deleted_at: string | null;
  edited_at: string | null;
  client?: ReviewClient;
  reply?: ReviewReply | null;
  created_at: string | null;
}

export interface ReviewsPaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedReviews {
  reviews: Review[];
  meta: ReviewsPaginationMeta;
}

export interface CreateReviewPayload {
  rating: number;
  comment?: string | null;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string | null;
}

export interface CreateReviewReplyPayload {
  body: string;
}

export interface UpdateReviewReplyPayload {
  body: string;
}
