import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppBadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { AppButtonComponent } from '../../../../shared/ui/button/button.component';
import { AppCardComponent } from '../../../../shared/ui/card/card.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { extractTime, formatTimeRange, toDateInputValue } from '../../../../shared/utils/date.util';
import { ServicesApi } from '../../../services/data-access/services.api';
import { Service } from '../../../services/models/service.models';
import { AvailabilityApi } from '../../data-access/availability.api';
import {
  AvailabilityException,
  AvailabilityRule,
  AvailabilitySlot,
  DayOfWeek,
} from '../../models/availability.models';

type AvailabilityTab = 'rules' | 'exceptions' | 'preview';

@Component({
  selector: 'app-availability-manager-page',
  imports: [
    ReactiveFormsModule,
    AppAlertComponent,
    AppBadgeComponent,
    AppButtonComponent,
    AppCardComponent,
    AppEmptyStateComponent,
    AppLoadingSpinnerComponent,
    AppPageHeaderComponent,
  ],
  templateUrl: './availability-manager-page.component.html',
  styleUrl: './availability-manager-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailabilityManagerPageComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly servicesApi = inject(ServicesApi);
  private readonly availabilityApi = inject(AvailabilityApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly services = signal<Service[]>([]);
  readonly selectedServiceId = signal<string | null>(null);
  readonly rules = signal<AvailabilityRule[]>([]);
  readonly exceptions = signal<AvailabilityException[]>([]);
  readonly slots = signal<AvailabilitySlot[]>([]);
  readonly tab = signal<AvailabilityTab>('rules');
  readonly isLoadingServices = signal(true);
  readonly isLoadingAvailability = signal(false);
  readonly isLoadingSlots = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly editingRuleId = signal<number | null>(null);
  readonly editingExceptionId = signal<number | null>(null);

  readonly selectedService = computed(() =>
    this.services().find((service) => String(service.id) === this.selectedServiceId()) ?? null,
  );

  readonly tabs: { label: string; value: AvailabilityTab }[] = [
    { label: 'Reglas semanales', value: 'rules' },
    { label: 'Excepciones', value: 'exceptions' },
    { label: 'Preview de slots', value: 'preview' },
  ];

  readonly days: { label: string; value: DayOfWeek }[] = [
    { label: 'Lunes', value: 1 },
    { label: 'Martes', value: 2 },
    { label: 'Miercoles', value: 3 },
    { label: 'Jueves', value: 4 },
    { label: 'Viernes', value: 5 },
    { label: 'Sabado', value: 6 },
    { label: 'Domingo', value: 7 },
  ];

  readonly ruleForm = this.fb.group({
    day_of_week: ['1', [Validators.required]],
    start_time: ['09:00', [Validators.required]],
    end_time: ['17:00', [Validators.required]],
    is_active: [true],
  });

  readonly exceptionForm = this.fb.group({
    exception_date: [toDateInputValue(new Date()), [Validators.required]],
    is_unavailable: [true],
    alt_start: ['11:00'],
    alt_end: ['14:00'],
    reason: [''],
  });

  readonly previewForm = this.fb.group({
    date: [toDateInputValue(new Date()), [Validators.required]],
  });

  ngOnInit(): void {
    this.servicesApi
      .mine()
      .pipe(
        finalize(() => this.isLoadingServices.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.services.set(response.services);
          const requestedService = this.route.snapshot.queryParamMap.get('serviceId');
          const firstService = response.services[0]?.id;
          this.selectedServiceId.set(requestedService ?? (firstService === undefined ? null : String(firstService)));
          this.loadAvailability();
        },
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });
  }

  changeService(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedServiceId.set(target.value);
    this.cancelRuleEdit();
    this.cancelExceptionEdit();
    this.loadAvailability();
  }

  saveRule(): void {
    const serviceId = this.selectedServiceId();
    if (!serviceId) return;

    if (this.ruleForm.invalid || this.ruleTimeInvalid()) {
      this.ruleForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.clearFeedback();

    const value = this.ruleForm.getRawValue();
    const payload = {
      day_of_week: Number(value.day_of_week) as DayOfWeek,
      start_time: value.start_time,
      end_time: value.end_time,
      is_active: value.is_active,
    };
    const editingId = this.editingRuleId();
    const request = editingId
      ? this.availabilityApi.updateRule(editingId, payload)
      : this.availabilityApi.createRule(serviceId, payload);

    request
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          const rule = response.availability_rule;
          this.rules.update((rules) =>
            editingId ? rules.map((item) => (item.id === rule.id ? rule : item)) : [rule, ...rules],
          );
          this.cancelRuleEdit();
          this.successMessage.set('Regla guardada correctamente.');
          this.loadSlots();
        },
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });
  }

  editRule(rule: AvailabilityRule): void {
    this.editingRuleId.set(rule.id);
    this.ruleForm.patchValue({
      day_of_week: String(rule.day_of_week),
      start_time: extractTime(rule.start_time),
      end_time: extractTime(rule.end_time),
      is_active: rule.is_active,
    });
  }

  cancelRuleEdit(): void {
    this.editingRuleId.set(null);
    this.ruleForm.reset({
      day_of_week: '1',
      start_time: '09:00',
      end_time: '17:00',
      is_active: true,
    });
  }

  deleteRule(rule: AvailabilityRule): void {
    if (!confirm(`Eliminar regla de ${this.dayLabel(rule.day_of_week)}?`)) return;

    this.clearFeedback();
    this.availabilityApi
      .deleteRule(rule.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.rules.update((rules) => rules.filter((item) => item.id !== rule.id));
          this.successMessage.set('Regla eliminada correctamente.');
          this.loadSlots();
        },
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });
  }

  saveException(): void {
    const serviceId = this.selectedServiceId();
    if (!serviceId) return;

    if (this.exceptionForm.invalid || this.exceptionTimeInvalid()) {
      this.exceptionForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.clearFeedback();

    const value = this.exceptionForm.getRawValue();
    const payload = {
      exception_date: value.exception_date,
      is_unavailable: value.is_unavailable,
      alt_start: value.is_unavailable ? null : value.alt_start,
      alt_end: value.is_unavailable ? null : value.alt_end,
      reason: value.reason.trim() || null,
    };
    const editingId = this.editingExceptionId();
    const request = editingId
      ? this.availabilityApi.updateException(editingId, payload)
      : this.availabilityApi.createException(serviceId, payload);

    request
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          const exception = response.availability_exception;
          this.exceptions.update((exceptions) =>
            editingId
              ? exceptions.map((item) => (item.id === exception.id ? exception : item))
              : [exception, ...exceptions],
          );
          this.cancelExceptionEdit();
          this.successMessage.set('Excepcion guardada correctamente.');
          this.loadSlots();
        },
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });
  }

  editException(exception: AvailabilityException): void {
    this.editingExceptionId.set(exception.id);
    this.exceptionForm.patchValue({
      exception_date: exception.exception_date,
      is_unavailable: exception.is_unavailable,
      alt_start: exception.alt_start ?? '11:00',
      alt_end: exception.alt_end ?? '14:00',
      reason: exception.reason ?? '',
    });
  }

  cancelExceptionEdit(): void {
    this.editingExceptionId.set(null);
    this.exceptionForm.reset({
      exception_date: toDateInputValue(new Date()),
      is_unavailable: true,
      alt_start: '11:00',
      alt_end: '14:00',
      reason: '',
    });
  }

  deleteException(exception: AvailabilityException): void {
    if (!confirm(`Eliminar excepcion del ${exception.exception_date}?`)) return;

    this.clearFeedback();
    this.availabilityApi
      .deleteException(exception.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.exceptions.update((exceptions) => exceptions.filter((item) => item.id !== exception.id));
          this.successMessage.set('Excepcion eliminada correctamente.');
          this.loadSlots();
        },
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });
  }

  loadSlots(): void {
    const serviceId = this.selectedServiceId();
    if (!serviceId || this.previewForm.invalid) return;

    this.isLoadingSlots.set(true);
    this.availabilityApi
      .slots(serviceId, this.previewForm.getRawValue().date)
      .pipe(
        finalize(() => this.isLoadingSlots.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.slots.set(response.slots),
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });
  }

  ruleTimeInvalid(): boolean {
    const value = this.ruleForm.getRawValue();
    return !!value.start_time && !!value.end_time && value.end_time <= value.start_time;
  }

  exceptionTimeInvalid(): boolean {
    const value = this.exceptionForm.getRawValue();
    if (value.is_unavailable) return false;
    return !value.alt_start || !value.alt_end || value.alt_end <= value.alt_start;
  }

  dayLabel(day: DayOfWeek): string {
    return this.days.find((item) => item.value === day)?.label ?? String(day);
  }

  slotLabel(slot: AvailabilitySlot): string {
    return formatTimeRange(slot.starts_at, slot.ends_at);
  }

  private loadAvailability(): void {
    const serviceId = this.selectedServiceId();
    if (!serviceId) return;

    this.isLoadingAvailability.set(true);
    this.clearFeedback();

    this.availabilityApi
      .rules(serviceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.rules.set(response.availability_rules ?? []),
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });

    this.availabilityApi
      .exceptions(serviceId)
      .pipe(
        finalize(() => this.isLoadingAvailability.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.exceptions.set(response.availability_exceptions ?? []),
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });

    this.loadSlots();
  }

  private clearFeedback(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  private errorFrom(error: unknown): string {
    if (error instanceof ApiClientError) return error.message;
    return 'No pudimos completar la accion de disponibilidad.';
  }
}
