export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type AvailabilityRule = {
  id: number;
  service_id: string | number;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
};

export type StoreAvailabilityRuleRequest = {
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_active?: boolean;
};

export type AvailabilityRulesResponse = {
  availability_rules: AvailabilityRule[];
};

export type AvailabilityRuleResponse = {
  availability_rule: AvailabilityRule;
};

export type AvailabilityException = {
  id: number;
  service_id: string | number;
  exception_date: string;
  is_unavailable: boolean;
  alt_start: string | null;
  alt_end: string | null;
  reason: string | null;
  created_at: string;
};

export type StoreAvailabilityExceptionRequest = {
  exception_date: string;
  is_unavailable?: boolean;
  alt_start?: string | null;
  alt_end?: string | null;
  reason?: string | null;
};

export type AvailabilityExceptionsResponse = {
  availability_exceptions: AvailabilityException[];
};

export type AvailabilityExceptionResponse = {
  availability_exception: AvailabilityException;
};

export type AvailabilitySlot = {
  starts_at: string;
  ends_at: string;
};

export type AvailabilitySlotsResponse = {
  service_id: string | number;
  date: string;
  slots: AvailabilitySlot[];
};
