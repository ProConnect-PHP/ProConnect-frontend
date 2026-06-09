import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, of, tap, throwError } from 'rxjs';

import { ApiClientError } from '../../../../core/http/models/api-error.model';
import {
  BookingPolicyFieldErrors,
  getApiFieldErrors,
  getApiValidationMessage,
} from '../utils/booking-policy-error.util';
import {
  ProfessionalBookingPolicy,
  ProfessionalBookingReminderRule,
} from '../models/booking-policy.model';
import {
  UpdateBookingPolicyPayload,
  UpsertReminderRulePayload,
} from '../models/booking-policy.payload';
import { BookingPolicyApiService } from './booking-policy-api.service';

@Injectable()
export class BookingPolicyStore {
  private readonly api = inject(BookingPolicyApiService);

  readonly policy = signal<ProfessionalBookingPolicy | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly ruleSaving = signal(false);
  readonly activeRuleId = signal<string | 'new' | null>(null);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly ruleFieldErrors = signal<BookingPolicyFieldErrors>({});

  readonly reminderRules = computed(() => this.policy()?.reminderRules ?? []);
  readonly hasReminderRules = computed(() => this.reminderRules().length > 0);

  loadPolicy(): Observable<ProfessionalBookingPolicy> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getPolicy().pipe(
      tap((policy) => this.policy.set(policy)),
      catchError((error: unknown) => {
        this.error.set(
          getApiValidationMessage(
            error,
            'No pudimos cargar tu configuracion de reservas.',
          ),
        );
        return throwError(() => error);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  savePolicy(
    payload: UpdateBookingPolicyPayload,
  ): Observable<ProfessionalBookingPolicy> {
    this.saving.set(true);
    this.clearFeedback();

    return this.api.updatePolicy(payload).pipe(
      tap((policy) => {
        this.policy.set(policy);
        this.successMessage.set('Configuracion guardada correctamente.');
      }),
      catchError((error: unknown) => {
        this.error.set(getApiValidationMessage(error));
        return throwError(() => error);
      }),
      finalize(() => this.saving.set(false)),
    );
  }

  createReminderRule(
    payload: UpsertReminderRulePayload,
  ): Observable<ProfessionalBookingReminderRule> {
    this.beginRuleOperation('new');

    return this.api.createReminderRule(payload).pipe(
      tap((rule) => {
        this.updateRules((rules) => [...rules, rule]);
        this.successMessage.set('Recordatorio agregado correctamente.');
      }),
      catchError((error: unknown) => this.handleRuleError(error)),
      finalize(() => this.endRuleOperation()),
    );
  }

  updateReminderRule(
    id: string,
    payload: UpsertReminderRulePayload,
  ): Observable<ProfessionalBookingReminderRule> {
    this.beginRuleOperation(id);

    return this.api.updateReminderRule(id, payload).pipe(
      tap((updatedRule) => {
        this.updateRules((rules) =>
          rules.map((rule) => (rule.id === updatedRule.id ? updatedRule : rule)),
        );
        this.successMessage.set('Recordatorio actualizado correctamente.');
      }),
      catchError((error: unknown) => this.handleRuleError(error)),
      finalize(() => this.endRuleOperation()),
    );
  }

  deleteReminderRule(id: string): Observable<void> {
    this.beginRuleOperation(id);

    return this.api.deleteReminderRule(id).pipe(
      tap(() => {
        this.removeRule(id);
        this.successMessage.set('Recordatorio eliminado correctamente.');
      }),
      catchError((error: unknown) => {
        if (error instanceof ApiClientError && error.status === 404) {
          this.removeRule(id);
          this.successMessage.set('El recordatorio ya no existia y fue quitado de la lista.');
          return of(undefined);
        }

        return this.handleRuleError(error);
      }),
      finalize(() => this.endRuleOperation()),
    );
  }

  toggleReminderRule(
    id: string,
    isActive: boolean,
    payload: UpsertReminderRulePayload,
  ): Observable<ProfessionalBookingReminderRule> {
    this.beginRuleOperation(id);

    return this.api.updateReminderRule(id, { ...payload, is_active: isActive }).pipe(
      tap((updatedRule) => {
        this.updateRules((rules) =>
          rules.map((rule) => (rule.id === updatedRule.id ? updatedRule : rule)),
        );
        this.successMessage.set(
          isActive ? 'Recordatorio activado correctamente.' : 'Recordatorio desactivado.',
        );
      }),
      catchError((error: unknown) => this.handleRuleError(error)),
      finalize(() => this.endRuleOperation()),
    );
  }

  clearFeedback(): void {
    this.error.set(null);
    this.successMessage.set(null);
    this.ruleFieldErrors.set({});
  }

  clearRuleErrors(): void {
    this.error.set(null);
    this.ruleFieldErrors.set({});
  }

  private beginRuleOperation(id: string | 'new'): void {
    this.clearFeedback();
    this.ruleSaving.set(true);
    this.activeRuleId.set(id);
  }

  private endRuleOperation(): void {
    this.ruleSaving.set(false);
    this.activeRuleId.set(null);
  }

  private handleRuleError(error: unknown): Observable<never> {
    this.error.set(getApiValidationMessage(error));
    this.ruleFieldErrors.set(getApiFieldErrors(error));
    return throwError(() => error);
  }

  private removeRule(id: string): void {
    this.updateRules((rules) => rules.filter((rule) => rule.id !== id));
  }

  private updateRules(
    update: (
      rules: ProfessionalBookingReminderRule[],
    ) => ProfessionalBookingReminderRule[],
  ): void {
    this.policy.update((policy) =>
      policy
        ? {
            ...policy,
            reminderRules: update(policy.reminderRules),
          }
        : policy,
    );
  }
}
