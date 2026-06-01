import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppButtonComponent } from '../../../../shared/ui/button/button.component';
import { AppFormFieldComponent } from '../../../../shared/ui/form-field/form-field.component';
import { AppInputComponent } from '../../../../shared/ui/input/input.component';
import { AuthStore } from '../../../../core/auth/services/auth.store';
import { AuthCardComponent } from '../../components/auth-card/auth-card.component';

@Component({
  selector: 'app-register-page',
  imports: [
    AuthCardComponent,
    ReactiveFormsModule,
    RouterLink,
    AppAlertComponent,
    AppButtonComponent,
    AppFormFieldComponent,
    AppInputComponent,
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly authStore = inject(AuthStore);

  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group(
    {
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authStore
      .register(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigate(['/login'], { queryParams: { registered: '1' } }),
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });
  }

  fieldError(
    controlName: 'name' | 'email' | 'password' | 'password_confirmation',
  ): string | null {
    const control = this.form.controls[controlName];
    if (!control.touched || control.valid) {
      if (controlName === 'password_confirmation' && this.form.hasError('passwordMismatch')) {
        return 'Los passwords no coinciden.';
      }
      return null;
    }

    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('email')) return 'Ingresa un email valido.';
    if (control.hasError('minlength')) return 'Usa al menos 8 caracteres.';
    return 'Revisa este campo.';
  }

  private errorFrom(error: unknown): string {
    if (error instanceof ApiClientError) return error.message;
    return 'No pudimos crear la cuenta. Intenta nuevamente.';
  }
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('password_confirmation')?.value;

  return password && confirmation && password !== confirmation ? { passwordMismatch: true } : null;
}
