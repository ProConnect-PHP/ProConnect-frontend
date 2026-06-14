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
import { catchError, finalize, of, switchMap, tap } from 'rxjs';

import { AuthStore } from '../../../../core/auth/services/auth.store';
import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppCardComponent } from '../../../../shared/ui/card/card.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { AccountApiService } from '../../data-access/account-api.service';
import { ProfileFormComponent, ProfileFormSubmitPayload } from '../../components/profile-form/profile-form.component';

type AccountProfile = {
  readonly id?: string | number;
  readonly name?: string | null;
  readonly email?: string | null;
  readonly user?: {
    readonly email?: string | null;
  } | null;
  readonly [key: string]: unknown;
};

type AccountProfileUpdatePayload = ProfileFormSubmitPayload;
@Component({
  selector: 'app-account-settings-page',
  standalone: true,
  imports: [
    AppAlertComponent,
    AppCardComponent,
    AppLoadingSpinnerComponent,
    AppPageHeaderComponent,
    ProfileFormComponent,
  ],
  templateUrl: './account-settings-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsPageComponent implements OnInit {
  private readonly accountApi = inject(AccountApiService);
  private readonly authStore = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly userProfile = signal<AccountProfile | null>(null);

  readonly loading = signal(true);
  readonly savingProfile = signal(false);
  readonly sendingEmail = signal(false);
  readonly passwordResetConfirmationVisible = signal(false);

  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly passwordResetEmail = computed(() => {
    const profile = this.userProfile();

    return profile?.email || profile?.user?.email || null;
  });

  readonly canRequestPasswordReset = computed(() => {
    return !!this.passwordResetEmail() && !this.sendingEmail();
  });

  readonly accountDisplayName = computed(() => {
    return this.userProfile()?.name || this.authStore.currentUser()?.name || 'Tu cuenta';
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  onSaveProfile(updatedData: ProfileFormSubmitPayload): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.savingProfile.set(true);

    this.accountApi
      .updateProfile(updatedData)
      .pipe(
        switchMap(() => this.accountApi.getProfile()),
        tap((profile) => this.userProfile.set(profile as AccountProfile)),
        switchMap(() =>
          this.authStore.loadCurrentUser().pipe(
            catchError(() => of(null)),
          ),
        ),
        finalize(() => this.savingProfile.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Tus cambios fueron guardados correctamente.');
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            this.errorFrom(error, 'Hubo un error al intentar actualizar tus datos.'),
          );
        },
      });
  }

  onOpenPasswordResetConfirmation(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (!this.passwordResetEmail()) {
      this.errorMessage.set('No se pudo determinar el correo electrónico de tu cuenta.');
      return;
    }

    this.passwordResetConfirmationVisible.set(true);
  }

  onCancelPasswordResetConfirmation(): void {
    if (this.sendingEmail()) return;

    this.passwordResetConfirmationVisible.set(false);
  }

  onConfirmPasswordResetRequest(): void {
    const email = this.passwordResetEmail();

    if (!email) {
      this.errorMessage.set('No se pudo determinar el correo electrónico de tu cuenta.');
      return;
    }

    this.sendingEmail.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.accountApi
      .sendPasswordResetEmail(email)
      .pipe(
        finalize(() => this.sendingEmail.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.passwordResetConfirmationVisible.set(false);
          this.successMessage.set(
            'Te enviamos un enlace seguro para restablecer tu contraseña.',
          );
        },
        error: (error: unknown) => {
          if (this.isSuccessfulHttpParsingAnomaly(error)) {
            this.passwordResetConfirmationVisible.set(false);
            this.successMessage.set(
              'Te enviamos un enlace seguro para restablecer tu contraseña.',
            );
            return;
          }

          this.errorMessage.set(
            this.errorFrom(
              error,
              'Por seguridad, esperá unos minutos antes de solicitar otro enlace.',
            ),
          );
        },
      });
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.accountApi
      .getProfile()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (profile) => {
          this.userProfile.set(profile as AccountProfile);
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            this.errorFrom(error, 'No pudimos cargar tus datos de perfil.'),
          );
        },
      });
  }

  private errorFrom(error: unknown, fallback: string): string {
    if (error instanceof ApiClientError) {
      return error.message || fallback;
    }

    const serverMessage = this.extractServerMessage(error);

    if (serverMessage && !serverMessage.includes('Http failure response')) {
      return serverMessage;
    }

    return fallback;
  }

  private extractServerMessage(error: unknown): string | null {
    if (!this.isRecord(error)) return null;

    const directMessage = error['message'];
    if (typeof directMessage === 'string') return directMessage;

    const errorBody = error['error'];
    if (!this.isRecord(errorBody)) return null;

    const message = errorBody['message'];
    if (typeof message === 'string') return message;

    const nestedError = errorBody['error'];
    if (!this.isRecord(nestedError)) return null;

    const nestedMessage = nestedError['message'];
    if (typeof nestedMessage === 'string') return nestedMessage;

    return null;
  }

  private isSuccessfulHttpParsingAnomaly(error: unknown): boolean {
    if (!this.isRecord(error)) return false;

    const status = error['status'];

    return status === 200 || status === 204;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
