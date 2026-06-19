import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, finalize, timer } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import { ApiClientError } from '../../../core/http/models/api-error.model';

type PasswordUpdateResponse = {
  readonly status: 'success' | 'error';
  readonly message?: string;
};

type PasswordUpdatePayload = {
  readonly token: string;
  readonly email: string;
  readonly password: string;
  readonly password_confirmation: string;
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordPage implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiClient = inject(ApiClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly token = signal('');
  readonly email = signal('');

  readonly submitting = signal(false);
  readonly redirecting = signal(false);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly form = this.fb.group(
    {
      password: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(128),
        ],
      }),
      password_confirmation: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(128),
        ],
      }),
    },
    {
      validators: passwordMatchValidator,
    },
  );

  readonly hasRequiredLinkData = computed(() => {
    return this.token().length > 0 && this.email().length > 0;
  });

  readonly canSubmit = computed(() => {
    return this.hasRequiredLinkData() && !this.submitting() && !this.redirecting();
  });

  ngOnInit(): void {
    combineLatest([
      this.route.paramMap,
      this.route.queryParamMap,
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([paramMap, queryParamMap]) => {
        const token = queryParamMap.get('token') || paramMap.get('token') || '';
        const email = queryParamMap.get('email') || '';

        this.token.set(token.trim());
        this.email.set(this.safeDecode(email).trim());

        if (!this.token() || !this.email()) {
          this.errorMessage.set(
            'El enlace de restablecimiento no es válido o está incompleto. Solicitá uno nuevo.',
          );
        }
      });
  }

  get passwordControl(): AbstractControl<string> {
    return this.form.controls.password;
  }

  get passwordConfirmationControl(): AbstractControl<string> {
    return this.form.controls.password_confirmation;
  }

  get passwordInvalid(): boolean {
    return this.passwordControl.invalid && (this.passwordControl.dirty || this.passwordControl.touched);
  }

  get passwordConfirmationInvalid(): boolean {
    return (
      this.passwordConfirmationControl.invalid &&
      (this.passwordConfirmationControl.dirty || this.passwordConfirmationControl.touched)
    );
  }

  get passwordMismatch(): boolean {
    return (
      this.form.hasError('passwordMismatch') &&
      (this.passwordConfirmationControl.dirty || this.passwordConfirmationControl.touched)
    );
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.hasRequiredLinkData()) {
      this.errorMessage.set(
        'El enlace de restablecimiento no es válido o está incompleto. Solicitá uno nuevo.',
      );
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    const payload: PasswordUpdatePayload = {
      token: this.token(),
      email: this.email(),
      password: formValue.password,
      password_confirmation: formValue.password_confirmation,
    };

    this.submitting.set(true);

    this.apiClient
      .post<PasswordUpdateResponse>('/auth/password-update', payload)
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.form.reset();
          this.redirecting.set(true);

          this.successMessage.set(
            response.message || 'Tu contraseña fue actualizada correctamente. Ya podés iniciar sesión.',
          );

          timer(1800)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              void this.router.navigate(['/login'], {
                queryParams: {
                  passwordReset: 'success',
                },
              });
            });
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            this.errorFrom(
              error,
              'No pudimos actualizar la contraseña. Verificá el enlace o solicitá uno nuevo.',
            ),
          );
        },
      });
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

  private safeDecode(value: string): string {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const passwordConfirmation = control.get('password_confirmation')?.value;

  if (!password || !passwordConfirmation) {
    return null;
  }

  return password === passwordConfirmation ? null : { passwordMismatch: true };
}
