export type AgendaBookingStatus =
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type AgendaStatusFilter = 'all' | AgendaBookingStatus;

export type AgendaEventType = 'booking';

export type AgendaModality = 'remote' | 'in_person' | 'hybrid' | string;

export type ProfessionalAgendaClient = {
  id: number;
  name: string;
  avatar_url: string | null;
};

export type ProfessionalAgendaService = {
  id: number;
  name: string;
  duration_minutes: number;
  modality: string;
  address: string | null;
};

export type ProfessionalAgendaClientPackage = {
  id: number;
  status: string;
  total_sessions: number;
  used_sessions: number;
  remaining_sessions: number;
  expires_at: string | null;
};

export type ProfessionalAgendaPackageSession = {
  id: number;
  status: string;
  consumed_at: string | null;
  released_at: string | null;
};

export type ProfessionalAgendaVideoSession = {
  id: number;
  status: string;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  can_join_now: boolean;
};

export type ProfessionalAgendaFlags = {
  is_cancelled: boolean;
  is_pending: boolean;
  is_confirmed: boolean;
  is_paid: boolean;
  is_completed: boolean;
  is_no_show: boolean;
  has_video_session: boolean;
  uses_package: boolean;
};

export type ProfessionalAgendaEvent = {
  id: number;
  type: AgendaEventType;
  title: string;
  starts_at: string;
  ends_at: string;
  status: AgendaBookingStatus;
  modality: AgendaModality;
  service: ProfessionalAgendaService | null;
  client: ProfessionalAgendaClient | null;
  payment_status: string | null;
  payment_source: 'payment' | 'package' | null;
  client_package: ProfessionalAgendaClientPackage | null;
  package_session: ProfessionalAgendaPackageSession | null;
  video_session: ProfessionalAgendaVideoSession | null;
  flags: ProfessionalAgendaFlags;
  created_at: string | null;
};

export type ProfessionalAgendaSummary = {
  total: number;
  pending: number;
  confirmed: number;
  paid: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  no_show: number;
};

export type ProfessionalAgendaRange = {
  from: string;
  to: string;
};

export type ProfessionalAgendaResponse = {
  timezone: string;
  range: ProfessionalAgendaRange;
  events: ProfessionalAgendaEvent[];
  summary: ProfessionalAgendaSummary;
};

export type ProfessionalAgendaQuery = {
  from: string;
  to: string;
  status?: AgendaBookingStatus;
  service_id?: number;
};
