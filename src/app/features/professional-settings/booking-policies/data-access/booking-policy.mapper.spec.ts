import {
  mapBookingPolicyFromDto,
  mapBookingPolicyToUpdatePayload,
  mapReminderRuleFromDto,
} from './booking-policy.mapper';

describe('booking policy mapper', () => {
  it('maps a policy from snake_case to camelCase and normalizes null rules', () => {
    const policy = mapBookingPolicyFromDto({
      allow_client_cancellation: true,
      cancellation_cutoff_minutes: 120,
      allow_client_rescheduling: false,
      rescheduling_cutoff_minutes: 60,
      late_tolerance_minutes: 10,
      reminders_enabled: true,
      cancellation_policy_text: 'Texto de cancelacion',
      rescheduling_policy_text: null,
      reminder_rules: null,
    });

    expect(policy.allowClientCancellation).toBe(true);
    expect(policy.reschedulingCutoffMinutes).toBe(60);
    expect(policy.reminderRules).toEqual([]);
  });

  it('maps reminder channels and recipients', () => {
    const rule = mapReminderRuleFromDto({
      id: 'rule-1',
      minutes_before_start: 1440,
      send_email: true,
      send_database_notification: true,
      send_push: false,
      send_whatsapp: true,
      notify_client: true,
      notify_professional: false,
      is_active: true,
    });

    expect(rule.minutesBeforeStart).toBe(1440);
    expect(rule.sendWhatsapp).toBe(true);
    expect(rule.notifyProfessional).toBe(false);
  });

  it('builds the update payload in snake_case and trims optional copy', () => {
    const payload = mapBookingPolicyToUpdatePayload({
      allowClientCancellation: true,
      cancellationCutoffMinutes: 120,
      allowClientRescheduling: true,
      reschedulingCutoffMinutes: 60,
      lateToleranceMinutes: 10,
      remindersEnabled: false,
      cancellationPolicyText: '  Hasta 2 horas antes.  ',
      reschedulingPolicyText: '   ',
    });

    expect(payload).toEqual({
      allow_client_cancellation: true,
      cancellation_cutoff_minutes: 120,
      allow_client_rescheduling: true,
      rescheduling_cutoff_minutes: 60,
      late_tolerance_minutes: 10,
      reminders_enabled: false,
      cancellation_policy_text: 'Hasta 2 horas antes.',
      rescheduling_policy_text: null,
    });
  });
});
