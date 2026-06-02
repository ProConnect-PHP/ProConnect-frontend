import { PublicService } from '../../public-discovery/models/public-discovery.models';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type BookingUserSummary = {
  id: string;
  name: string;
  avatar_url: string | null;
};

export type BookingProfessionalSummary = {
  id: string;
  bio: string | null;
  is_verified: boolean;
  user: BookingUserSummary | null;
};

export type Booking = {
  id: string;
  service_id: string | number;
  professional_id: string;
  client_id: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  modality: 'presencial' | 'remota' | 'hibrida';
  price_snapshot: string | number;
  duration_minutes_snapshot: number;
  confirmed_at: string | null;
  cancelled_at: string | null;
  paid_at: string | null;
  completed_at: string | null;
  no_show_at: string | null;
  cancellation_reason: string | null;
  reschedule_reason: string | null;
  service?: PublicService | null;
  professional?: BookingProfessionalSummary | null;
  client?: BookingUserSummary | null;
  created_at: string;
};

export type BookingResponse = {
  message?: string;
  booking: Booking;
};

export type BookingsResponse = {
  bookings: Booking[];
};

export type CreateBookingRequest = {
  starts_at: string;
};

export type CancelBookingRequest = {
  reason?: string | null;
};

export type RescheduleBookingRequest = {
  starts_at: string;
  reason?: string | null;
};

export type BookingContext = 'client' | 'professional';

export type BookingListFilter =
  | 'upcoming'
  | 'past'
  | 'cancelled'
  | 'all'
  | 'pending'
  | 'confirmed';
