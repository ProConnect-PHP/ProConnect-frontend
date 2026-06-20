import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import {
  CreatePaymentCheckoutRequest,
  ClientPaymentsQuery,
  CreatePaymentIntentRequest,
  PaginatedPayments,
  PaymentDetail,
  PaymentHistoryItem,
  PaymentIntent,
  PaymentListParams,
  PaymentMovement,
  PaymentMovementsResponse,
  PaymentStatusResult,
  SimulatePaymentFailurePayload,
  PaginatedResponse,
} from './payments.models';
import {
  unwrapPaginatedPaymentsResponse,
  unwrapPaymentIntentResponse,
  unwrapMyPaymentsResponse,
  unwrapPaymentDetailResponse,
  unwrapPaymentMovementResponse,
  unwrapPaymentMovementsResponse,
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

  syncProviderStatus(
    paymentIntentId: string,
    payload: Record<string, string> = {},
  ) {
    return this.api.post<PaymentStatusResult>(
      `payment-intents/${paymentIntentId}/sync-provider-status`,
      payload,
    );
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

  getMyPayments(page = 1, perPage = 10): Observable<PaginatedResponse<PaymentHistoryItem>> {
    return this.api.get<PaginatedResponse<PaymentHistoryItem>>(
      `me/payments`,
      {
        params: {
          page,
          per_page: perPage,
        },
      },
    );
  }

  getMyPayment(paymentId: string): Observable<PaymentDetail> {
    return this.api
      .get<unknown>(`me/payments/${paymentId}`)
      .pipe(map((response) => unwrapPaymentDetailResponse(response)));
  }

  /**
   * Legacy unified movements feed. It remains available for backwards
   * compatibility, but it must not power the confirmed-payments UI.
   */
  getMyPaymentMovements(params: ClientPaymentsQuery = {}): Observable<PaymentMovementsResponse> {
    return this.api
      .get<unknown>('payments/my', { params: this.toApiParams(params) })
      .pipe(map((response) => unwrapPaymentMovementsResponse(response)));
  }

  refreshPaymentMovement(paymentIntentId: string): Observable<PaymentMovement> {
    return this.api
      .get<unknown>(`payment-intents/${paymentIntentId}/status`)
      .pipe(map((response) => unwrapPaymentMovementResponse(response)));
  }

  listProfessionalPayments(params: PaymentListParams = {}): Observable<PaginatedPayments> {
    return this.api
      .get<unknown>('professional/payments', { params: this.toApiParams(params) })
      .pipe(map((response) => unwrapPaginatedPaymentsResponse(response)));
  }

  private toApiParams(
    params: PaymentListParams | ClientPaymentsQuery,
  ): Record<string, string | number | boolean | undefined> {
    return {
      page: params.page,
      per_page: params.per_page,
      ...(this.isClientPaymentsQuery(params)
        ? {
          status: params.status,
          provider: params.provider,
          kind: params.kind,
          booking_id: params.booking_id,
          only_pending: params.only_pending,
          only_final: params.only_final,
          date_from: params.date_from,
          date_to: params.date_to,
          search: params.search,
        }
        : {}),
    };
  }

  private isClientPaymentsQuery(
    params: PaymentListParams | ClientPaymentsQuery,
  ): params is ClientPaymentsQuery {
    return (
      'status' in params ||
      'provider' in params ||
      'kind' in params ||
      'booking_id' in params ||
      'only_pending' in params ||
      'only_final' in params ||
      'date_from' in params ||
      'date_to' in params ||
      'search' in params
    );
  }
}
