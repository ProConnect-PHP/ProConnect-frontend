import {
  mapBookingAvailableActionsFromDto,
  mapBookingAvailableActionsResponse,
} from './booking-available-actions.mapper';

describe('booking available actions mapper', () => {
  it('maps the API DTO to camelCase', () => {
    const actions = mapBookingAvailableActionsFromDto({
      can_cancel: false,
      can_reschedule: true,
      cancel_disabled_reason: 'Fuera de plazo.',
      reschedule_disabled_reason: null,
    });

    expect(actions).toEqual({
      canCancel: false,
      canReschedule: true,
      cancelDisabledReason: 'Fuera de plazo.',
      rescheduleDisabledReason: null,
    });
  });

  it('unwraps data responses', () => {
    const actions = mapBookingAvailableActionsResponse({
      data: {
        can_cancel: true,
        can_reschedule: false,
        cancel_disabled_reason: null,
        reschedule_disabled_reason: 'Fuera de plazo.',
      },
    });

    expect(actions.canCancel).toBe(true);
    expect(actions.rescheduleDisabledReason).toBe('Fuera de plazo.');
  });
});
