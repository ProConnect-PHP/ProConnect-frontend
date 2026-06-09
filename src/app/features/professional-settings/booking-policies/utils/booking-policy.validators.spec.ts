import { FormControl, FormGroup } from '@angular/forms';

import {
  atLeastOneChannelValidator,
  atLeastOneRecipientValidator,
  uniqueReminderTimeValidator,
} from './booking-policy.validators';

function createRuleForm() {
  return new FormGroup(
    {
      minutesBeforeStart: new FormControl(120, { nonNullable: true }),
      sendEmail: new FormControl(false, { nonNullable: true }),
      sendDatabaseNotification: new FormControl(false, { nonNullable: true }),
      sendPush: new FormControl(false, { nonNullable: true }),
      sendWhatsapp: new FormControl(false, { nonNullable: true }),
      notifyClient: new FormControl(false, { nonNullable: true }),
      notifyProfessional: new FormControl(false, { nonNullable: true }),
    },
    {
      validators: [atLeastOneChannelValidator(), atLeastOneRecipientValidator()],
    },
  );
}

describe('booking policy validators', () => {
  it('requires at least one channel', () => {
    const form = createRuleForm();

    expect(form.hasError('atLeastOneChannel')).toBe(true);
  });

  it('requires at least one recipient', () => {
    const form = createRuleForm();

    expect(form.hasError('atLeastOneRecipient')).toBe(true);
  });

  it('rejects a duplicated reminder time', () => {
    const form = createRuleForm();
    form.addValidators(
      uniqueReminderTimeValidator([
        {
          id: 'rule-1',
          minutesBeforeStart: 120,
          sendEmail: true,
          sendDatabaseNotification: false,
          sendPush: false,
          sendWhatsapp: false,
          notifyClient: true,
          notifyProfessional: false,
          isActive: true,
        },
      ]),
    );
    form.updateValueAndValidity();

    expect(form.hasError('duplicatedReminderTime')).toBe(true);
  });

  it('allows the same time while editing that rule', () => {
    const form = createRuleForm();
    form.addValidators(
      uniqueReminderTimeValidator(
        [
          {
            id: 'rule-1',
            minutesBeforeStart: 120,
            sendEmail: true,
            sendDatabaseNotification: false,
            sendPush: false,
            sendWhatsapp: false,
            notifyClient: true,
            notifyProfessional: false,
            isActive: true,
          },
        ],
        'rule-1',
      ),
    );
    form.updateValueAndValidity();

    expect(form.hasError('duplicatedReminderTime')).toBe(false);
  });
});
