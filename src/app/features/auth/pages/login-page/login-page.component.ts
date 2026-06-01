import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppButtonComponent } from '../../../../shared/ui/button/button.component';
import { AppFormFieldComponent } from '../../../../shared/ui/form-field/form-field.component';
import { AppInputComponent } from '../../../../shared/ui/input/input.component';
import { AuthStore } from '../../../../core/auth/services/auth.store';
import { AuthCardComponent } from '../../components/auth-card/auth-card.component';

@Component({
  selector: 'app-login-page',
  imports: [
    AuthCardComponent,
    ReactiveFormsModule,
    RouterLink,
    AppAlertComponent,
    AppButtonComponent,
    AppFormFieldComponent,
    AppInputComponent,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly authStore = inject(AuthStore);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(
    this.route.snapshot.queryParamMap.get('registered') === '1'
      ? 'Cuenta creada correctamente. Ya podes iniciar sesion.'
      : null,
  );

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authStore
      .login(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/dashboard';
          void this.router.navigateByUrl(redirectTo);
        },
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });
  }

  fieldError(controlName: 'email' | 'password'): string | null {
    const control = this.form.controls[controlName];
    if (!control.touched || control.valid) return null;
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('email')) return 'Ingresa un email valido.';
    return 'Revisa este campo.';
  }

  private errorFrom(error: unknown): string {
    if (error instanceof ApiClientError) return error.message;
    return 'No pudimos iniciar sesion. Revisa tus datos e intenta nuevamente.';
  }
}
