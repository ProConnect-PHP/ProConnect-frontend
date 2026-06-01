import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppButtonComponent } from '../../../../shared/ui/button/button.component';
import { AppFormFieldComponent } from '../../../../shared/ui/form-field/form-field.component';
import { AppInputComponent } from '../../../../shared/ui/input/input.component';
import { AppSelectComponent } from '../../../../shared/ui/select/select.component';
import { AppTextareaComponent } from '../../../../shared/ui/textarea/textarea.component';
import {
  Service,
  ServiceDuration,
  ServiceModality,
  StoreServiceRequest,
} from '../../models/service.models';

type ServiceFormControls = {
  name: string;
  description: string;
  price: string;
  duration_minutes: string;
  modality: ServiceModality;
  address: string;
  link: string;
  latitude: string;
  longitude: string;
  max_bookings_per_client: string;
  min_reschedule_minutes: string;
  buffer_minutes: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

@Component({
  selector: 'app-service-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AppAlertComponent,
    AppButtonComponent,
    AppFormFieldComponent,
    AppInputComponent,
    AppSelectComponent,
    AppTextareaComponent,
  ],
  templateUrl: './service-form.component.html',
  styleUrl: './service-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly service = input<Service | null>(null);
  readonly isSaving = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly submitLabel = input('Guardar servicio');
  readonly save = output<StoreServiceRequest>();

  readonly durations: ServiceDuration[] = [15, 30, 45, 60, 90, 120];

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    price: ['0', [Validators.required]],
    duration_minutes: ['60', [Validators.required]],
    modality: this.fb.control<ServiceModality>('remota', { validators: [Validators.required] }),
    address: [''],
    link: [''],
    latitude: [''],
    longitude: [''],
    max_bookings_per_client: [''],
    min_reschedule_minutes: ['10', [Validators.required]],
    buffer_minutes: ['15', [Validators.required]],
    starts_at: [''],
    ends_at: [''],
    is_active: [true],
  });

  readonly modality = toSignal(this.form.controls.modality.valueChanges, {
    initialValue: this.form.controls.modality.value,
  });

  constructor() {
    effect(() => {
      const service = this.service();
      if (!service) return;

      const value: ServiceFormControls = {
        name: service.name,
        description: service.description ?? '',
        price: String(service.price),
        duration_minutes: String(service.duration_minutes),
        modality: service.modality,
        address: service.address ?? '',
        link: service.link ?? '',
        latitude: service.latitude === null ? '' : String(service.latitude),
        longitude: service.longitude === null ? '' : String(service.longitude),
        max_bookings_per_client:
          service.max_bookings_per_client === null ? '' : String(service.max_bookings_per_client),
        min_reschedule_minutes: String(service.min_reschedule_minutes),
        buffer_minutes: String(service.buffer_minutes),
        starts_at: service.starts_at ?? '',
        ends_at: service.ends_at ?? '',
        is_active: service.is_active,
      };

      this.form.patchValue(value, { emitEvent: false });
    });

    this.form.controls.latitude.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.form.controls.latitude.updateValueAndValidity({ emitEvent: false }));
  }

  submit(): void {
    if (this.form.invalid || !this.hasValidNumbers()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.save.emit({
      name: value.name.trim(),
      description: nullableText(value.description),
      price: Number(value.price),
      duration_minutes: Number(value.duration_minutes) as ServiceDuration,
      modality: value.modality,
      address: nullableText(value.address),
      link: nullableText(value.link),
      latitude: numberOrNull(value.latitude),
      longitude: numberOrNull(value.longitude),
      max_bookings_per_client: integerOrNull(value.max_bookings_per_client),
      min_reschedule_minutes: Number(value.min_reschedule_minutes),
      buffer_minutes: Number(value.buffer_minutes),
      starts_at: nullableText(value.starts_at),
      ends_at: nullableText(value.ends_at),
      is_active: value.is_active,
    });
  }

  fieldError(controlName: keyof ServiceFormControls): string | null {
    const control = this.form.controls[controlName];
    if (!control.touched || control.valid) return null;
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    return 'Revisa este campo.';
  }

  private hasValidNumbers(): boolean {
    const value = this.form.getRawValue();
    const price = Number(value.price);
    const buffer = Number(value.buffer_minutes);
    const reschedule = Number(value.min_reschedule_minutes);
    const latitude = numberOrNull(value.latitude);
    const longitude = numberOrNull(value.longitude);

    return (
      !Number.isNaN(price) &&
      price >= 0 &&
      !Number.isNaN(buffer) &&
      buffer >= 0 &&
      !Number.isNaN(reschedule) &&
      reschedule >= 0 &&
      (latitude === null || (latitude >= -90 && latitude <= 90)) &&
      (longitude === null || (longitude >= -180 && longitude <= 180))
    );
  }
}

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function numberOrNull(value: string): number | null {
  if (!value.trim()) return null;
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
}

function integerOrNull(value: string): number | null {
  const numberValue = numberOrNull(value);
  return numberValue === null ? null : Math.trunc(numberValue);
}
