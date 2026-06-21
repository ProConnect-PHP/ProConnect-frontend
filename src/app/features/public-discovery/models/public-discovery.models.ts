export type PublicServiceModality = 'presencial' | 'remota' | 'hibrida';

export type PublicServiceDuration = 15 | 30 | 45 | 60 | 90 | 120;

export type PublicServiceSort =
  | 'recent'
  | 'price_asc'
  | 'price_desc'
  | 'duration_asc'
  | 'duration_desc'
  | 'rating_desc';

export type PublicServicesViewMode = 'list' | 'map';

export type PublicServiceFilterKey =
  | 'search'
  | 'modality'
  | 'min_price'
  | 'max_price'
  | 'duration_minutes'
  | 'available_date'
  | 'latitude'
  | 'longitude'
  | 'radius_km';

export type PublicUserSummary = {
  id: string;
  name: string;
  avatar_url: string | null;
};

export type PublicProfessional = {
  id: string;
  bio: string | null;
  avg_rating: number;
  reviews_count: number;
  is_verified: boolean;
  user: PublicUserSummary | null;
  services?: PublicService[];
};

export type PublicCompany = {
  id: number | string;
  commercial_name: string;
};

export type PublicService = {
  id: number | string;
  name: string;
  description: string | null;
  price: string | number;
  duration_minutes: number;
  modality: PublicServiceModality;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  buffer_minutes: number;
  min_reschedule_minutes: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  professional?: PublicProfessional | null;
  company?: PublicCompany | null;
  created_at: string;
};

export type PublicServicesMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type PublicServicesResponse = {
  services: PublicService[];
  meta: PublicServicesMeta;
};

export type PublicServiceResponse = {
  service: PublicService;
};

export type PublicProfessionalResponse = {
  professional: PublicProfessional;
};

export type PublicServicesQuery = {
  search?: string | null;
  modality?: PublicServiceModality | null;
  min_price?: number | null;
  max_price?: number | null;
  duration_minutes?: PublicServiceDuration | null;
  available_date?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radius_km?: number | null;
  per_page?: number | null;
  page?: number | null;
  sort?: PublicServiceSort | null;
};

export type AvailabilitySlot = {
  starts_at: string;
  ends_at: string;
};

export type AvailabilitySlotsResponse = {
  service_id: number | string;
  date: string;
  slots: AvailabilitySlot[];
};
