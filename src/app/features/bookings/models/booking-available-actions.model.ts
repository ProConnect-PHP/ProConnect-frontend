export interface BookingAvailableActions {
  canCancel: boolean;
  canReschedule: boolean;
  cancelDisabledReason: string | null;
  rescheduleDisabledReason: string | null;
}
