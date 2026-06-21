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
  sessions_count: FormControl<string | number>;
  price: FormControl<string | number>;
  validity_days: FormControl<string | number>;
  is_active: FormControl<boolean>;
};

const DEFAULT_CURRENCY = 'UYU';

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
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(3000)],
    }),
    sessions_count: new FormControl<string | number>(4, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(100)],
    }),
    price: new FormControl<string | number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    validity_days: new FormControl<string | number>('', {
      nonNullable: true,
    }),
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
              sessions_count: 4,
              price: 0,
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
          sessions_count: packageProduct.sessions_count,
          price: packageProduct.price,
          validity_days:
            packageProduct.validity_days === null ? '' : packageProduct.validity_days,
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
      service_id: nullableId(value.service_id),
      name: value.name.trim(),
      description: nullableText(value.description),
      sessions_count: Math.trunc(toNumber(value.sessions_count) ?? 0),
      price: toNumber(value.price) ?? 0,
      currency: DEFAULT_CURRENCY,
      validity_days: integerOrNull(value.validity_days),
      is_active: value.is_active,
    });
  }

  fieldError(controlName: keyof PackageProductFormControls): string | null {
    const control = this.form.controls[controlName];

    if (!control.touched || control.valid) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (control.hasError('maxlength')) {
      return 'El texto supera el maximo permitido.';
    }

    if (control.hasError('min')) {
      return 'El valor es menor al permitido.';
    }

    if (control.hasError('max')) {
      return 'El valor supera el maximo permitido.';
    }

    return 'Revisa este campo.';
  }

  descriptionLength(): number {
    return this.form.controls.description.value.length;
  }

  pricePreview(): string {
    const price = toNumber(this.form.controls.price.value);
    const sessions = toNumber(this.form.controls.sessions_count.value);

    if (
      price === null ||
      sessions === null ||
      !Number.isFinite(price) ||
      !Number.isFinite(sessions) ||
      sessions <= 0
    ) {
      return 'Precio por sesion no disponible';
    }

    return `${formatMoney(price / sessions, DEFAULT_CURRENCY)} por sesion`;
  }

  private hasValidNumbers(): boolean {
    const value = this.form.getRawValue();

    const sessions = integerOrNull(value.sessions_count);
    const price = toNumber(value.price);
    const validityDays = integerOrNull(value.validity_days);

    return (
      sessions !== null &&
      sessions >= 1 &&
      sessions <= 100 &&
      price !== null &&
      price >= 0 &&
      (validityDays === null || (validityDays >= 1 && validityDays <= 3650))
    );
  }
}

function nullableId(value: string): string | null {
  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function nullableText(value: string): string | null {
  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function toNumber(value: string | number): number | null {
  if (value === '') {
    return null;
  }

  const parsed =
    typeof value === 'number'
      ? value
      : Number(value.trim());

  return Number.isFinite(parsed) ? parsed : null;
}

function integerOrNull(value: string | number): number | null {
  const parsed = toNumber(value);

  if (parsed === null) {
    return null;
  }

  const integer = Math.trunc(parsed);

  return Number.isFinite(integer) ? integer : null;
}
