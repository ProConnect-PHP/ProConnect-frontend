import {
  ProfessionalBookingPolicyDto,
  ProfessionalBookingReminderRuleDto,
} from '../models/booking-policy.dto';
import {
  BookingPolicyGeneralSettings,
  ProfessionalBookingPolicy,
  ProfessionalBookingReminderRule,
  ReminderRuleDraft,
} from '../models/booking-policy.model';
import {
  UpdateBookingPolicyPayload,
  UpsertReminderRulePayload,
} from '../models/booking-policy.payload';

export function mapBookingPolicyFromDto(
  dto: ProfessionalBookingPolicyDto,
): ProfessionalBookingPolicy {
  return {
    allowClientCancellation: dto.allow_client_cancellation,
    cancellationCutoffMinutes: dto.cancellation_cutoff_minutes,
    allowClientRescheduling: dto.allow_client_rescheduling,
    reschedulingCutoffMinutes: dto.rescheduling_cutoff_minutes,
    lateToleranceMinutes: dto.late_tolerance_minutes,
    remindersEnabled: dto.reminders_enabled,
    cancellationPolicyText: dto.cancellation_policy_text,
    reschedulingPolicyText: dto.rescheduling_policy_text,
    reminderRules: (dto.reminder_rules ?? []).map(mapReminderRuleFromDto),
  };
}

export function mapReminderRuleFromDto(
  dto: ProfessionalBookingReminderRuleDto,
): ProfessionalBookingReminderRule {
  return {
    id: dto.id,
    minutesBeforeStart: dto.minutes_before_start,
    sendEmail: dto.send_email,
    sendDatabaseNotification: dto.send_database_notification,
    sendPush: dto.send_push,
    sendWhatsapp: dto.send_whatsapp,
    notifyClient: dto.notify_client,
    notifyProfessional: dto.notify_professional,
    isActive: dto.is_active,
  };
}

export function mapBookingPolicyToUpdatePayload(
  settings: BookingPolicyGeneralSettings,
): UpdateBookingPolicyPayload {
  return {
    allow_client_cancellation: settings.allowClientCancellation,
    cancellation_cutoff_minutes: settings.cancellationCutoffMinutes,
    allow_client_rescheduling: settings.allowClientRescheduling,
    rescheduling_cutoff_minutes: settings.reschedulingCutoffMinutes,
    late_tolerance_minutes: settings.lateToleranceMinutes,
    reminders_enabled: settings.remindersEnabled,
    cancellation_policy_text: normalizedText(settings.cancellationPolicyText),
    rescheduling_policy_text: normalizedText(settings.reschedulingPolicyText),
  };
}

export function mapReminderRuleToPayload(
  rule: ReminderRuleDraft,
): UpsertReminderRulePayload {
  return {
    minutes_before_start: rule.minutesBeforeStart,
    send_email: rule.sendEmail,
    send_database_notification: rule.sendDatabaseNotification,
    send_push: rule.sendPush,
    send_whatsapp: rule.sendWhatsapp,
    notify_client: rule.notifyClient,
    notify_professional: rule.notifyProfessional,
    is_active: rule.isActive,
  };
}

function normalizedText(value: string | null): string | null {
  const text = value?.trim() ?? '';
  return text || null;
}
