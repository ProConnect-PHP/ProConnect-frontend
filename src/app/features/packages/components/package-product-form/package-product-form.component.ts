import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { formatMoney, formatMoneyDecimal } from '../../../../shared/utils/money.util';
import { Service } from '../../../services/models/service.models';
import { PackageProductFieldErrors } from '../../data-access/packages-error.mapper';
import { PackageProduct, StorePackageProductPayload } from '../../data-access/packages.models';

type PackageProductFormMode = 'create' | 'edit';
type NumericFormValue = string | number | null;

type PackageProductFormControls = {
  service_id: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  sessions_count: FormControl<NumericFormValue>;
  price: FormControl<NumericFormValue>;
  validity_days: FormControl<NumericFormValue>;
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
  readonly fieldErrors = input<PackageProductFieldErrors>({});

  readonly submitted = output<StorePackageProductPayload>();
  readonly cancelled = output<void>();
  readonly valueChanged = output<void>();

  private readonly destroyRef = inject(DestroyRef);

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
    sessions_count: new FormControl<NumericFormValue>(4, {
      validators: [Validators.required, integerRangeValidator(1, 100)],
    }),
    price: new FormControl<NumericFormValue>(null, {
      validators: [Validators.required, positiveMoneyValidator(1, 999_999)],
    }),
    validity_days: new FormControl<NumericFormValue>('', {
      validators: [nullableIntegerRangeValidator(1, 3650)],
    }),
    is_active: new FormControl(true, { nonNullable: true }),
  });

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.valueChanged.emit());

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
              price: null,
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
    if (this.form.invalid) {
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
    const backendError = this.fieldErrors()[controlName];

    if (backendError) {
      return backendError;
    }

    if (!control.touched || control.valid) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (control.hasError('maxlength')) {
      return 'El texto supera el maximo permitido.';
    }

    if (control.hasError('integerRange')) {
      const range = control.getError('integerRange') as { min: number; max: number };
      return `Ingresa un numero entero entre ${range.min} y ${range.max}.`;
    }

    if (control.hasError('positiveMoney')) {
      const range = control.getError('positiveMoney') as { min: number; max: number };
      return `Ingresa un precio entero entre UYU ${range.min} y UYU ${range.max}.`;
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
      !Number.isInteger(price) ||
      price < 1 ||
      !Number.isInteger(sessions) ||
      sessions <= 0
    ) {
      return 'Precio por sesion no disponible.';
    }

    return `${formatMoneyDecimal(price / sessions, DEFAULT_CURRENCY)} por sesion`;
  }

  totalPricePreview(): string {
    const price = toNumber(this.form.controls.price.value);
    return price === null || !Number.isInteger(price) || price < 1
      ? 'No disponible.'
      : formatMoney(price, DEFAULT_CURRENCY);
  }

  sessionsPreview(): string {
    const sessions = toNumber(this.form.controls.sessions_count.value);
    return sessions !== null && Number.isInteger(sessions) && sessions > 0
      ? String(sessions)
      : 'No disponible.';
  }

  hasLowPriceWarning(): boolean {
    const price = toNumber(this.form.controls.price.value);
    const sessions = toNumber(this.form.controls.sessions_count.value);

    return (
      price !== null &&
      sessions !== null &&
      Number.isInteger(price) &&
      price >= 1 &&
      Number.isInteger(sessions) &&
      sessions > 0 &&
      price / sessions < 50
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

function toNumber(value: NumericFormValue): number | null {
  if (value === null || value === '') {
    return null;
  }

  const parsed =
    typeof value === 'number'
      ? value
      : Number(value.trim());

  return Number.isFinite(parsed) ? parsed : null;
}

function integerOrNull(value: NumericFormValue): number | null {
  const parsed = toNumber(value);

  if (parsed === null) {
    return null;
  }

  return Number.isInteger(parsed) ? parsed : null;
}

function integerRangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = integerOrNull(control.value as NumericFormValue);

    if (value === null) {
      return control.value === null || control.value === '' ? null : { integerRange: { min, max } };
    }

    return value >= min && value <= max ? null : { integerRange: { min, max } };
  };
}

function nullableIntegerRangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === '') {
      return null;
    }

    return integerRangeValidator(min, max)(control);
  };
}

function positiveMoneyValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = toNumber(control.value as NumericFormValue);

    if (value === null) {
      return null;
    }

    return Number.isInteger(value) && value >= min && value <= max
      ? null
      : { positiveMoney: { min, max } };
  };
}
