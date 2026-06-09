import { BookingAvailableActions } from '../models/booking-available-actions.model';
import {
  BookingAvailableActionsDto,
  BookingAvailableActionsResponse,
} from './booking-available-actions.dto';

export function mapBookingAvailableActionsFromDto(
  dto: BookingAvailableActionsDto,
): BookingAvailableActions {
  return {
    canCancel: dto.can_cancel,
    canReschedule: dto.can_reschedule,
    cancelDisabledReason: dto.cancel_disabled_reason,
    rescheduleDisabledReason: dto.reschedule_disabled_reason,
  };
}

export function mapBookingAvailableActionsResponse(
  response: BookingAvailableActionsResponse,
): BookingAvailableActions {
  if ('data' in response) return mapBookingAvailableActionsFromDto(response.data);
  if ('available_actions' in response) {
    return mapBookingAvailableActionsFromDto(response.available_actions);
  }

  return mapBookingAvailableActionsFromDto(response);
}
