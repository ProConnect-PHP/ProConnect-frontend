import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import {
  CreatePaymentCheckoutRequest,
  CreatePaymentIntentRequest,
  PaginatedPayments,
  Payment,
  PaymentIntent,
  PaymentListParams,
  PaymentStatusResult,
  SimulatePaymentFailurePayload,
} from './payments.models';
import {
  unwrapPaginatedPaymentsResponse,
  unwrapPaymentIntentResponse,
  unwrapPaymentResponse,
  unwrapPaymentStatusResponse,
} from './payments.mapper';

@Injectable({ providedIn: 'root' })
export class PaymentsApi {
  private readonly api = inject(ApiClient);

  createPaymentIntent(payload: CreatePaymentIntentRequest): Observable<PaymentIntent> {
    return this.api
      .post<unknown, CreatePaymentIntentRequest>('payment-intents', payload)
      .pipe(map((response) => unwrapPaymentIntentResponse(response)));
  }

  createCheckout(
    paymentIntentId: string,
    payload: CreatePaymentCheckoutRequest,
  ): Observable<PaymentIntent> {
    return this.api
      .post<unknown, CreatePaymentCheckoutRequest>(
        `payment-intents/${paymentIntentId}/checkout`,
        payload,
      )
      .pipe(map((response) => unwrapPaymentIntentResponse(response)));
  }

  getPaymentIntent(paymentIntentId: string): Observable<PaymentIntent> {
    return this.api
      .get<unknown>(`payment-intents/${paymentIntentId}`)
      .pipe(map((response) => unwrapPaymentIntentResponse(response)));
  }

  getPaymentStatus(paymentIntentId: string): Observable<PaymentStatusResult> {
    return this.api
      .get<unknown>(`payment-intents/${paymentIntentId}/status`)
      .pipe(map((response) => unwrapPaymentStatusResponse(response)));
  }

  simulateSuccess(paymentIntentId: string): Observable<PaymentStatusResult> {
    return this.api
      .post<unknown, Record<string, never>>(
        `payment-intents/${paymentIntentId}/simulate-success`,
        {},
      )
      .pipe(map((response) => unwrapPaymentStatusResponse(response)));
  }

  simulateFailure(
    paymentIntentId: string,
    payload: SimulatePaymentFailurePayload,
  ): Observable<PaymentStatusResult> {
    return this.api
      .post<unknown, SimulatePaymentFailurePayload>(
        `payment-intents/${paymentIntentId}/simulate-failure`,
        payload,
      )
      .pipe(map((response) => unwrapPaymentStatusResponse(response)));
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
