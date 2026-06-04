import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

import { formatMoney } from '../../../../shared/utils/money.util';
import { Service } from '../../../services/models/service.models';
import { PackageProduct, StorePackageProductPayload } from '../../data-access/packages.models';

type PackageProductFormMode = 'create' | 'edit';

type PackageProductFormControls = {
  service_id: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  sessions_count: FormControl<string>;
  price: FormControl<string>;
  currency: FormControl<string>;
  validity_days: FormControl<string>;
  is_active: FormControl<boolean>;
};

@Component({
  selector: 'app-package-product-form',
  imports: [ReactiveFormsModule],
  templateUrl: './package-product-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageProductFormComponent {
  readonly mode = input<PackageProductFormMode>('create');
  readonly initialValue = input<PackageProduct | null>(null);
  readonly services = input<Service[]>([]);
  readonly submitting = input(false);
  readonly errorMessage = input<string | null>(null);

  readonly submitted = output<StorePackageProductPayload>();
  readonly cancelled = output<void>();

  readonly form = new FormGroup<PackageProductFormControls>({
    service_id: new FormControl('', { nonNullable: true }),
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(150)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(3000)] }),
    sessions_count: new FormControl('4', {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(100)],
    }),
    price: new FormControl('0', {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    currency: new FormControl('UYU', { nonNullable: true, validators: [Validators.required] }),
    validity_days: new FormControl('', { nonNullable: true }),
    is_active: new FormControl(true, { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const packageProduct = this.initialValue();
      if (!packageProduct) {
        if (this.mode() === 'create') {
          this.form.patchValue(
            {
              service_id: '',
              name: '',
              description: '',
              sessions_count: '4',
              price: '0',
              currency: 'UYU',
              validity_days: '',
              is_active: true,
            },
            { emitEvent: false },
          );
        }
        return;
      }

      this.form.patchValue(
        {
          service_id: packageProduct.service_id === null ? '' : String(packageProduct.service_id),
          name: packageProduct.name,
          description: packageProduct.description ?? '',
          sessions_count: String(packageProduct.sessions_count),
          price: String(packageProduct.price),
          currency: packageProduct.currency,
          validity_days:
            packageProduct.validity_days === null ? '' : String(packageProduct.validity_days),
          is_active: packageProduct.is_active,
        },
        { emitEvent: false },
      );
    });
  }

  submit(): void {
    if (this.form.invalid || !this.hasValidNumbers()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.submitted.emit({
      service_id: value.service_id ? value.service_id : null,
      name: value.name.trim(),
      description: nullableText(value.description),
      sessions_count: Math.trunc(Number(value.sessions_count)),
      price: Number(value.price),
      currency: value.currency.trim() || 'UYU',
      validity_days: integerOrNull(value.validity_days),
      is_active: value.is_active,
    });
  }

  fieldError(controlName: keyof PackageProductFormControls): string | null {
    const control = this.form.controls[controlName];
    if (!control.touched || control.valid) return null;
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('maxlength')) return 'El texto supera el maximo permitido.';
    return 'Revisa este campo.';
  }

  descriptionLength(): number {
    return this.form.controls.description.value.length;
  }

  pricePreview(): string {
    const price = Number(this.form.controls.price.value);
    const sessions = Number(this.form.controls.sessions_count.value);
    const currency = this.form.controls.currency.value || 'UYU';
    if (!Number.isFinite(price) || !Number.isFinite(sessions) || sessions <= 0) {
      return 'Precio por sesion no disponible';
    }

    return `${formatMoney(price / sessions, currency)} por sesion`;
  }

  private hasValidNumbers(): boolean {
    const value = this.form.getRawValue();
    const sessions = Math.trunc(Number(value.sessions_count));
    const price = Number(value.price);
    const validityDays = integerOrNull(value.validity_days);

    return (
      Number.isFinite(sessions) &&
      sessions >= 1 &&
      sessions <= 100 &&
      Number.isFinite(price) &&
      price >= 0 &&
      (validityDays === null || (validityDays >= 1 && validityDays <= 3650))
    );
  }
}

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function integerOrNull(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Math.trunc(Number(value));
  return Number.isFinite(parsed) ? parsed : null;
}
