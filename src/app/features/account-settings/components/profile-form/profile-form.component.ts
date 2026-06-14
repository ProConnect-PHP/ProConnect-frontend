import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export type ProfileFormInitialData = {
  readonly name?: string | null;
  readonly email?: string | null;
  readonly user?: {
    readonly name?: string | null;
    readonly email?: string | null;
  } | null;
};

export type ProfileFormSubmitPayload = {
  readonly name: string;
};

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly userInitialData = input.required<ProfileFormInitialData>();
  readonly submitting = input(false);

  readonly save = output<ProfileFormSubmitPayload>();

  readonly form = this.fb.group({
    name: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(120),
      ],
    }),
    email: this.fb.control(
      { value: '', disabled: true },
      {
        validators: [
          Validators.required,
          Validators.email,
        ],
      },
    ),
  });

  constructor() {
    effect(() => {
      const data = this.userInitialData();

      this.form.patchValue(
        {
          name: data.name || data.user?.name || '',
          email: data.email || data.user?.email || '',
        },
        {
          emitEvent: false,
        },
      );

      this.form.markAsPristine();
      this.form.markAsUntouched();
    });
  }

  get nameInvalid(): boolean {
    const control = this.form.controls.name;

    return control.invalid && (control.dirty || control.touched);
  }

  get nameRequired(): boolean {
    return this.form.controls.name.hasError('required');
  }

  get nameTooShort(): boolean {
    return this.form.controls.name.hasError('minlength');
  }

  get nameTooLong(): boolean {
    return this.form.controls.name.hasError('maxlength');
  }

  onSubmit(): void {
    if (this.submitting()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.save.emit({
      name: value.name.trim(),
    });
  }
}
