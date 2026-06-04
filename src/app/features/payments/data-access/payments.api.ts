import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import {
  CreatePaymentIntentPayload,
  PaginatedPayments,
  Payment,
  PaymentIntent,
  PaymentListParams,
  SimulatePaymentFailurePayload,
} from './payments.models';
import {
  unwrapPaginatedPaymentsResponse,
  unwrapPaymentIntentResponse,
  unwrapPaymentResponse,
} from './payments.mapper';

@Injectable({ providedIn: 'root' })
export class PaymentsApi {
  private readonly api = inject(ApiClient);

  createPaymentIntent(
    bookingId: string,
    payload: CreatePaymentIntentPayload = {},
  ): Observable<PaymentIntent> {
    return this.api
      .post<unknown, CreatePaymentIntentPayload>(`bookings/${bookingId}/payment-intents`, payload)
      .pipe(map((response) => unwrapPaymentIntentResponse(response)));
  }

  simulateSuccess(paymentIntentId: string): Observable<Payment> {
    return this.api
      .post<unknown, Record<string, never>>(
        `payment-intents/${paymentIntentId}/simulate-success`,
        {},
      )
      .pipe(map((response) => unwrapPaymentResponse(response)));
  }

  simulateFailure(
    paymentIntentId: string,
    payload: SimulatePaymentFailurePayload = {},
  ): Observable<PaymentIntent> {
    return this.api
      .post<unknown, SimulatePaymentFailurePayload>(
        `payment-intents/${paymentIntentId}/simulate-failure`,
        payload,
      )
      .pipe(map((response) => unwrapPaymentIntentResponse(response)));
  }

  listMyPayments(params: PaymentListParams = {}): Observable<PaginatedPayments> {
    return this.api
      .get<unknown>('payments/my', { params: this.toApiParams(params) })
      .pipe(map((response) => unwrapPaginatedPaymentsResponse(response)));
  }

  listProfessionalPayments(params: PaymentListParams = {}): Observable<PaginatedPayments> {
    return this.api
      .get<unknown>('professional/payments', { params: this.toApiParams(params) })
      .pipe(map((response) => unwrapPaginatedPaymentsResponse(response)));
  }

  private toApiParams(params: PaymentListParams): Record<string, number | undefined> {
    return {
      page: params.page,
      per_page: params.per_page,
    };
  }
}
