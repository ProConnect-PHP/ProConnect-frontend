export interface ProfessionalBookingPolicy {
  allowClientCancellation: boolean;
  cancellationCutoffMinutes: number;
  allowClientRescheduling: boolean;
  reschedulingCutoffMinutes: number;
  lateToleranceMinutes: number;
  remindersEnabled: boolean;
  cancellationPolicyText: string | null;
  reschedulingPolicyText: string | null;
  reminderRules: ProfessionalBookingReminderRule[];
}

export interface ProfessionalBookingReminderRule {
  id: string;
  minutesBeforeStart: number;
  sendEmail: boolean;
  sendDatabaseNotification: boolean;
  sendPush: boolean;
  sendWhatsapp: boolean;
  notifyClient: boolean;
  notifyProfessional: boolean;
  isActive: boolean;
}

export type BookingPolicyGeneralSettings = Omit<ProfessionalBookingPolicy, 'reminderRules'>;

export type ReminderRuleDraft = Omit<ProfessionalBookingReminderRule, 'id'>;
