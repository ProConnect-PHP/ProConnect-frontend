import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import {
  AvailabilityExceptionResponse,
  AvailabilityExceptionsResponse,
  AvailabilityRuleResponse,
  AvailabilityRulesResponse,
  AvailabilitySlotsResponse,
  StoreAvailabilityExceptionRequest,
  StoreAvailabilityRuleRequest,
} from '../models/availability.models';

@Injectable({ providedIn: 'root' })
export class AvailabilityApi {
  private readonly api = inject(ApiClient);

  rules(serviceId: string | number): Observable<AvailabilityRulesResponse> {
    return this.api.get<AvailabilityRulesResponse>(`services/${serviceId}/availability-rules`);
  }

  createRule(
    serviceId: string | number,
    payload: StoreAvailabilityRuleRequest,
  ): Observable<AvailabilityRuleResponse> {
    return this.api.post<AvailabilityRuleResponse, StoreAvailabilityRuleRequest>(
      `services/${serviceId}/availability-rules`,
      payload,
    );
  }

  updateRule(
    ruleId: string | number,
    payload: Partial<StoreAvailabilityRuleRequest>,
  ): Observable<AvailabilityRuleResponse> {
    return this.api.put<AvailabilityRuleResponse, Partial<StoreAvailabilityRuleRequest>>(
      `availability-rules/${ruleId}`,
      payload,
    );
  }

  deleteRule(ruleId: string | number): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`availability-rules/${ruleId}`);
  }

  exceptions(serviceId: string | number): Observable<AvailabilityExceptionsResponse> {
    return this.api.get<AvailabilityExceptionsResponse>(
      `services/${serviceId}/availability-exceptions`,
    );
  }

  createException(
    serviceId: string | number,
    payload: StoreAvailabilityExceptionRequest,
  ): Observable<AvailabilityExceptionResponse> {
    return this.api.post<AvailabilityExceptionResponse, StoreAvailabilityExceptionRequest>(
      `services/${serviceId}/availability-exceptions`,
      payload,
    );
  }

  updateException(
    exceptionId: string | number,
    payload: Partial<StoreAvailabilityExceptionRequest>,
  ): Observable<AvailabilityExceptionResponse> {
    return this.api.put<AvailabilityExceptionResponse, Partial<StoreAvailabilityExceptionRequest>>(
      `availability-exceptions/${exceptionId}`,
      payload,
    );
  }

  deleteException(exceptionId: string | number): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`availability-exceptions/${exceptionId}`);
  }

  slots(serviceId: string | number, date: string): Observable<AvailabilitySlotsResponse> {
    return this.api.get<AvailabilitySlotsResponse>(`services/${serviceId}/availability`, {
      params: { date },
    });
  }
}
