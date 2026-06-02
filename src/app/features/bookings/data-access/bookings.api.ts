import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import {
  BookingResponse,
  BookingsResponse,
  CancelBookingRequest,
  CreateBookingRequest,
  RescheduleBookingRequest,
} from '../models/booking.models';

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

  confirmBooking(bookingId: string): Observable<BookingResponse> {
    return this.api.post<BookingResponse, Record<string, never>>(
      `bookings/${bookingId}/confirm`,
      {},
    );
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
