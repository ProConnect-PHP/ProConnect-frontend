export interface BookingAvailableActionsDto {
  can_cancel: boolean;
  can_reschedule: boolean;
  cancel_disabled_reason: string | null;
  reschedule_disabled_reason: string | null;
}

export type BookingAvailableActionsResponse =
  | { data: BookingAvailableActionsDto }
  | { available_actions: BookingAvailableActionsDto }
  | BookingAvailableActionsDto;
