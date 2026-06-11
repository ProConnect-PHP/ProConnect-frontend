import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AuthStore } from '../../../../core/auth/services/auth.store';

@Component({
  selector: 'app-social-login-buttons',
  imports: [],
  templateUrl: './social-login-buttons.html',
  styleUrl: './social-login-buttons.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialLoginButtonsComponent {
  private readonly authStore = inject(AuthStore);

  loginWithGoogle(): void {
    this.authStore.redirectToOAuthProvider('google');
  }

  loginWithGithub(): void {
    this.authStore.redirectToOAuthProvider('github');
  }
}
