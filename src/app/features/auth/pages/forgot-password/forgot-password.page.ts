import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiClient } from '../../../../core/http/api.client';
import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppButtonComponent } from '../../../../shared/ui/button/button.component';
import { AppFormFieldComponent } from '../../../../shared/ui/form-field/form-field.component';
import { AppInputComponent } from '../../../../shared/ui/input/input.component';
import { AuthCardComponent } from '../../components/auth-card/auth-card.component';

type PasswordResetRequestResponse = {
  readonly status: 'success' | 'error';
  readonly message?: string;
};

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AppAlertComponent,
    AppButtonComponent,
    AppFormFieldComponent,
    AppInputComponent,
    AuthCardComponent,
  ],
  templateUrl: './forgot-password.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly apiClient = inject(ApiClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    email: this.fb.control('', {
      validators: [
        Validators.required,
        Validators.email,
        Validators.maxLength(255),
      ],
    }),
  });

  submit(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      email: this.form.controls.email.value.trim(),
    };

    this.isSubmitting.set(true);

    this.apiClient
      .post<PasswordResetRequestResponse>('/auth/account/password-reset', payload)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.successMessage.set(
            response.message ||
              'Si existe una cuenta asociada a ese correo, te enviaremos un enlace para restablecer la contraseña.',
          );

          this.form.reset();
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            this.errorFrom(
              error,
              'No pudimos procesar la solicitud. Intentá nuevamente en unos minutos.',
            ),
          );
        },
      });
  }

  fieldError(field: 'email'): string | null {
    const control = this.form.controls[field];

    if (!control || !control.invalid || (!control.dirty && !control.touched)) {
      return null;
    }

    if (control.hasError('required')) {
      return 'El email es obligatorio.';
    }

    if (control.hasError('email')) {
      return 'Ingresá un email válido.';
    }

    if (control.hasError('maxlength')) {
      return 'El email no puede superar los 255 caracteres.';
    }

    return 'El campo no es válido.';
  }

  private errorFrom(error: unknown, fallback: string): string {
    if (error instanceof ApiClientError) {
      return error.message || fallback;
    }

    if (this.isRecord(error)) {
      const directMessage = error['message'];

      if (typeof directMessage === 'string' && !directMessage.includes('Http failure response')) {
        return directMessage;
      }

      const body = error['error'];

      if (this.isRecord(body)) {
        const bodyMessage = body['message'];

        if (typeof bodyMessage === 'string' && !bodyMessage.includes('Http failure response')) {
          return bodyMessage;
        }
      }
    }

    return fallback;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
