import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import { BookingAvailableActions } from '../models/booking-available-actions.model';
import {
  BookingResponse,
  BookingsResponse,
  CancelBookingRequest,
  CreateBookingRequest,
  RescheduleBookingRequest,
} from '../models/booking.models';
import { BookingAvailableActionsResponse } from './booking-available-actions.dto';
import { mapBookingAvailableActionsResponse } from './booking-available-actions.mapper';

type CompleteBookingResponse =
  | BookingResponse
  | {
      data: BookingResponse['booking'];
      message?: string;
    };

@Injectable({ providedIn: 'root' })
export class BookingsApi {
  private readonly api = inject(ApiClient);

  createBooking(
    serviceId: string | number,
    payload: CreateBookingRequest,
  ): Observable<BookingResponse> {
    return this.api.post<BookingResponse, CreateBookingRequest>(
      `services/${serviceId}/bookings`,
      payload,
    );
  }

  listMyBookings(): Observable<BookingsResponse> {
    return this.api.get<BookingsResponse>('bookings/my');
  }

  listProfessionalBookings(): Observable<BookingsResponse> {
    return this.api.get<BookingsResponse>('professional/bookings');
  }

  showBooking(bookingId: string): Observable<BookingResponse> {
    return this.api.get<BookingResponse>(`bookings/${bookingId}`);
  }

  getAvailableActions(bookingId: string): Observable<BookingAvailableActions> {
    return this.api
      .get<BookingAvailableActionsResponse>(`bookings/${bookingId}/available-actions`)
      .pipe(map(mapBookingAvailableActionsResponse));
  }

  confirmBooking(bookingId: string): Observable<BookingResponse> {
    return this.api.post<BookingResponse, Record<string, never>>(
      `bookings/${bookingId}/confirm`,
      {},
    );
  }

  completeBooking(bookingId: string): Observable<BookingResponse> {
    return this.api
      .post<CompleteBookingResponse, Record<string, never>>(
        `professional/bookings/${bookingId}/complete`,
        {},
      )
      .pipe(map(mapCompleteBookingResponse));
  }

  cancelBooking(
    bookingId: string,
    payload: CancelBookingRequest,
  ): Observable<BookingResponse> {
    return this.api.post<BookingResponse, CancelBookingRequest>(
      `bookings/${bookingId}/cancel`,
      payload,
    );
  }

  rescheduleBooking(
    bookingId: string,
    payload: RescheduleBookingRequest,
  ): Observable<BookingResponse> {
    return this.api.post<BookingResponse, RescheduleBookingRequest>(
      `bookings/${bookingId}/reschedule`,
      payload,
    );
  }
}

function mapCompleteBookingResponse(response: CompleteBookingResponse): BookingResponse {
  if ('booking' in response) return response;

  return {
    booking: response.data,
    message: response.message,
  };
}
