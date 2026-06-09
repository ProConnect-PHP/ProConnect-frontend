export interface UpdateBookingPolicyPayload {
  allow_client_cancellation: boolean;
  cancellation_cutoff_minutes: number;
  allow_client_rescheduling: boolean;
  rescheduling_cutoff_minutes: number;
  late_tolerance_minutes: number;
  reminders_enabled: boolean;
  cancellation_policy_text: string | null;
  rescheduling_policy_text: string | null;
}

export interface UpsertReminderRulePayload {
  minutes_before_start: number;
  send_email: boolean;
  send_database_notification: boolean;
  send_push: boolean;
  send_whatsapp: boolean;
  notify_client: boolean;
  notify_professional: boolean;
  is_active: boolean;
}
