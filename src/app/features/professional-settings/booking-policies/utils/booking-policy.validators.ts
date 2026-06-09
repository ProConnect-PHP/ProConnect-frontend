import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { ProfessionalBookingReminderRule } from '../models/booking-policy.model';

export function atLeastOneChannelValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasChannel =
      control.get('sendEmail')?.value ||
      control.get('sendDatabaseNotification')?.value ||
      control.get('sendPush')?.value ||
      control.get('sendWhatsapp')?.value;

    return hasChannel ? null : { atLeastOneChannel: true };
  };
}

export function atLeastOneRecipientValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasRecipient =
      control.get('notifyClient')?.value || control.get('notifyProfessional')?.value;

    return hasRecipient ? null : { atLeastOneRecipient: true };
  };
}

export function uniqueReminderTimeValidator(
  existingRules: ProfessionalBookingReminderRule[],
  editingRuleId?: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const minutes = Number(control.get('minutesBeforeStart')?.value);
    const duplicated = existingRules.some(
      (rule) => rule.minutesBeforeStart === minutes && rule.id !== editingRuleId,
    );

    return duplicated ? { duplicatedReminderTime: true } : null;
  };
}
