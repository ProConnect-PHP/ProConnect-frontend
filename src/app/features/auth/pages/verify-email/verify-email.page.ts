import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthRedirectService } from '../../../../core/auth/services/auth-redirect.service';
import { AuthStore } from '../../../../core/auth/services/auth.store';
import { EmailVerificationApiService } from '../../../../core/auth/services/email-verification-api.service';

type VerifyEmailState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.page.html',
})
export class VerifyEmailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly authRedirect = inject(AuthRedirectService);
  private readonly emailVerificationApi = inject(EmailVerificationApiService);

  readonly state = signal<VerifyEmailState>('loading');
  readonly message = signal('Estamos verificando tu correo electrónico...');
  readonly verifiedWithActiveSession = signal(false);

  readonly canGoToApp = computed(() => {
    return this.state() === 'success' && this.verifiedWithActiveSession();
  });

  readonly canGoToLogin = computed(() => {
    return this.state() === 'success' && !this.verifiedWithActiveSession();
  });

  private submitted = false;

  ngOnInit(): void {
    if (this.submitted) {
      return;
    }

    this.submitted = true;

    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!email || !token) {
      this.state.set('error');
      this.message.set('El enlace de verificación no es válido.');
      return;
    }

    this.emailVerificationApi.verify({ email, token }).subscribe({
      next: (response) => {
        this.state.set('success');
        this.message.set(response.message || 'Correo electrónico verificado correctamente.');

        if (this.authStore.isAuthenticated()) {
          this.authStore.setCurrentUser(response.user);
          this.verifiedWithActiveSession.set(true);
          return;
        }

        this.verifiedWithActiveSession.set(false);
      },
      error: (error: unknown) => {
        this.state.set('error');
        this.message.set(this.resolveErrorMessage(error));
      },
    });
  }

  continueToApp(): void {
    const user = this.authStore.currentUser();

    if (!user) {
      void this.router.navigateByUrl('/login');
      return;
    }

    void this.router.navigateByUrl(this.authRedirect.getPostLoginRedirect(user));
  }

  goToLogin(): void {
    void this.router.navigateByUrl('/login');
  }

  goToVerificationRequired(): void {
    void this.router.navigateByUrl('/auth/email-verification-required');
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

    const apiError = httpError.error?.error;

    if (apiError?.code === 'INVALID_EMAIL_VERIFICATION_TOKEN') {
      return apiError.message || 'El enlace de verificación no es válido o expiró.';
    }

    if (httpError.status === 422) {
      return 'El enlace de verificación no es válido o expiró.';
    }

    return (
      apiError?.message ||
      httpError.error?.message ||
      'No pudimos verificar tu correo electrónico. Pedí un nuevo enlace e intentá nuevamente.'
    );
  }
}
