import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthStore } from '../../../../core/auth/services/auth.store';
import { EmailVerificationApiService } from '../../../../core/auth/services/email-verification-api.service';

@Component({
  selector: 'app-email-verification-required-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './email-verification-required.page.html',
})
export class EmailVerificationRequiredPage {
  private readonly authStore = inject(AuthStore);
  private readonly emailVerificationApi = inject(EmailVerificationApiService);
  private readonly router = inject(Router);

  readonly currentUser = this.authStore.currentUser;

  readonly isVerified = computed(() => {
    const user = this.currentUser();

    return user?.email_verified === true || !!user?.email_verified_at;
  });

  readonly isLoading = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  resendVerificationEmail(): void {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.emailVerificationApi
      .send()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.successMessage.set(response.message || 'Correo de verificación enviado.');

          if (response.email_verified) {
            const user = this.authStore.currentUser();

            if (user) {
              this.authStore.setCurrentUser({
                ...user,
                email_verified: true,
                email_verified_at: user.email_verified_at ?? new Date().toISOString(),
              });
            }
          }
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.resolveErrorMessage(error));
        },
      });
  }

  goToHome(): void {
    void this.router.navigateByUrl('/');
  }

  logout(): void {
    this.authStore.logout().subscribe({
      next: () => {
        void this.router.navigateByUrl('/login');
      },
      error: () => {
        void this.router.navigateByUrl('/login');
      },
    });
  }

  private resolveErrorMessage(error: unknown): string {
    const httpError = error as {
      status?: number;
      error?: {
        message?: string;
        error?: {
          message?: string;
          code?: string;
          type?: string;
        };
      };
    };

    if (httpError.status === 429) {
      return 'Solicitaste varios correos de verificación. Probá nuevamente en unos minutos.';
    }

    return (
      httpError.error?.error?.message ||
      httpError.error?.message ||
      'No pudimos enviar el correo de verificación. Intentá nuevamente.'
    );
  }
}
