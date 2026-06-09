import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiClient } from '../../../../core/http/api.client';
import {
  ApiResponse,
  ProfessionalBookingPolicyDto,
  ProfessionalBookingReminderRuleDto,
} from '../models/booking-policy.dto';
import {
  ProfessionalBookingPolicy,
  ProfessionalBookingReminderRule,
} from '../models/booking-policy.model';
import {
  UpdateBookingPolicyPayload,
  UpsertReminderRulePayload,
} from '../models/booking-policy.payload';
import { mapBookingPolicyFromDto, mapReminderRuleFromDto } from './booking-policy.mapper';

@Injectable({ providedIn: 'root' })
export class BookingPolicyApiService {
  private readonly api = inject(ApiClient);

  getPolicy(): Observable<ProfessionalBookingPolicy> {
    return this.api
      .get<ApiResponse<ProfessionalBookingPolicyDto>>('professional/me/booking-policy')
      .pipe(map((response) => mapBookingPolicyFromDto(response.data)));
  }

  updatePolicy(
    payload: UpdateBookingPolicyPayload,
  ): Observable<ProfessionalBookingPolicy> {
    return this.api
      .put<
        ApiResponse<ProfessionalBookingPolicyDto>,
        UpdateBookingPolicyPayload
      >('professional/me/booking-policy', payload)
      .pipe(map((response) => mapBookingPolicyFromDto(response.data)));
  }

  getReminderRules(): Observable<ProfessionalBookingReminderRule[]> {
    return this.api
      .get<ApiResponse<ProfessionalBookingReminderRuleDto[]>>(
        'professional/me/reminder-rules',
      )
      .pipe(map((response) => (response.data ?? []).map(mapReminderRuleFromDto)));
  }

  createReminderRule(
    payload: UpsertReminderRulePayload,
  ): Observable<ProfessionalBookingReminderRule> {
    return this.api
      .post<
        ApiResponse<ProfessionalBookingReminderRuleDto>,
        UpsertReminderRulePayload
      >('professional/me/reminder-rules', payload)
      .pipe(map((response) => mapReminderRuleFromDto(response.data)));
  }

  updateReminderRule(
    id: string,
    payload: UpsertReminderRulePayload,
  ): Observable<ProfessionalBookingReminderRule> {
    return this.api
      .put<
        ApiResponse<ProfessionalBookingReminderRuleDto>,
        UpsertReminderRulePayload
      >(`professional/me/reminder-rules/${id}`, payload)
      .pipe(map((response) => mapReminderRuleFromDto(response.data)));
  }

  deleteReminderRule(id: string): Observable<void> {
    return this.api.delete<void>(`professional/me/reminder-rules/${id}`);
  }
}
