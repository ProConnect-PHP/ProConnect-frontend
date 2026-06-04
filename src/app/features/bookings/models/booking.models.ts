import { PublicService } from '../../public-discovery/models/public-discovery.models';
import { Review } from '../../reviews/data-access/reviews.models';
import type { Payment } from '../../payments/data-access/payments.models';
import type { ClientPackage, PackageSession } from '../../packages/data-access/packages.models';

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
  payment_source?: 'payment' | 'package' | string | null;
  client_package_id?: string | null;
  cancellation_reason: string | null;
  reschedule_reason: string | null;
  service?: PublicService | null;
  review?: Review | null;
  // TODO backend: BookingResource should include payment when loading booking details.
  payment?: Payment | null;
  // TODO backend: BookingResource should include client_package/package_session for package-backed bookings.
  client_package?: ClientPackage | null;
  package_session?: PackageSession | null;
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
  client_package_id?: string;
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
