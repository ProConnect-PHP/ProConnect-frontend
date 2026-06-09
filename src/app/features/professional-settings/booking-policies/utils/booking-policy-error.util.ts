import { ApiClientError, ApiValidationDetails } from '../../../../core/http/models/api-error.model';

export type BookingPolicyFieldErrors = Partial<Record<string, string>>;

const apiToFormField: Record<string, string> = {
  allow_client_cancellation: 'allowClientCancellation',
  cancellation_cutoff_minutes: 'cancellationCutoffMinutes',
  allow_client_rescheduling: 'allowClientRescheduling',
  rescheduling_cutoff_minutes: 'reschedulingCutoffMinutes',
  late_tolerance_minutes: 'lateToleranceMinutes',
  reminders_enabled: 'remindersEnabled',
  cancellation_policy_text: 'cancellationPolicyText',
  rescheduling_policy_text: 'reschedulingPolicyText',
  minutes_before_start: 'minutesBeforeStart',
  send_email: 'sendEmail',
  send_database_notification: 'sendDatabaseNotification',
  send_push: 'sendPush',
  send_whatsapp: 'sendWhatsapp',
  notify_client: 'notifyClient',
  notify_professional: 'notifyProfessional',
  is_active: 'isActive',
  channels: 'channels',
  recipients: 'recipients',
};

export function getApiValidationMessage(
  error: unknown,
  fallback = 'No pudimos guardar los cambios. Intenta nuevamente.',
): string {
  if (error instanceof ApiClientError) {
    return firstValidationMessage(error.details) ?? error.message ?? fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}

export function getApiFieldErrors(error: unknown): BookingPolicyFieldErrors {
  if (!(error instanceof ApiClientError) || !error.details) return {};

  return Object.entries(error.details).reduce<BookingPolicyFieldErrors>(
    (fieldErrors, [apiField, messages]) => {
      const formField = apiToFormField[apiField] ?? apiField;
      const message = messages[0];
      if (message) fieldErrors[formField] = message;
      return fieldErrors;
    },
    {},
  );
}

function firstValidationMessage(details: ApiValidationDetails | null): string | null {
  if (!details) return null;

  for (const messages of Object.values(details)) {
    if (messages[0]) return messages[0];
  }

  return null;
}
