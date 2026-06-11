import { TestBed } from '@angular/core/testing';

import { AuthStore } from '../../../../core/auth/services/auth.store';
import { SocialLoginButtonsComponent } from './social-login-buttons';

describe('SocialLoginButtonsComponent', () => {
  const redirectToOAuthProvider = vi.fn();

  beforeEach(async () => {
    redirectToOAuthProvider.mockClear();

    await TestBed.configureTestingModule({
      imports: [SocialLoginButtonsComponent],
      providers: [
        {
          provide: AuthStore,
          useValue: { redirectToOAuthProvider },
        },
      ],
    }).compileComponents();
  });

  it('starts Google OAuth through AuthStore', () => {
    const fixture = TestBed.createComponent(SocialLoginButtonsComponent);

    fixture.componentInstance.loginWithGoogle();

    expect(redirectToOAuthProvider).toHaveBeenCalledWith('google');
  });

  it('starts GitHub OAuth through AuthStore', () => {
    const fixture = TestBed.createComponent(SocialLoginButtonsComponent);

    fixture.componentInstance.loginWithGithub();

    expect(redirectToOAuthProvider).toHaveBeenCalledWith('github');
  });
});
