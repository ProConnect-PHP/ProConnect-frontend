export type ServiceModality = 'presencial' | 'remota' | 'hibrida';

export type ServiceDuration = 15 | 30 | 45 | 60 | 90 | 120;

export type Service = {
  id: string | number;
  professional_id: string;
  company_id: string | number | null;
  name: string;
  description: string | null;
  price: string | number;
  duration_minutes: number;
  modality: ServiceModality;
  address: string | null;
  link: string | null;
  latitude: number | null;
  longitude: number | null;
  max_bookings_per_client: number | null;
  min_reschedule_minutes: number;
  buffer_minutes: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
};

export type StoreServiceRequest = {
  name: string;
  description?: string | null;
  price: number;
  duration_minutes: ServiceDuration;
  modality: ServiceModality;
  address?: string | null;
  link?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  max_bookings_per_client?: number | null;
  min_reschedule_minutes: number;
  buffer_minutes: number;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
};

export type ServiceResponse = {
  service: Service;
};

export type ServicesResponse = {
  services: Service[];
};
