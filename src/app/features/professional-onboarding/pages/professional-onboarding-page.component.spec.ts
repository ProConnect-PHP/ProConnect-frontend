import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { User } from '../../../core/auth/models/auth.models';
import { AuthStore } from '../../../core/auth/services/auth.store';
import { ProfessionalOnboardingPageComponent } from './professional-onboarding-page.component';

const client: User = {
  id: 'client-1',
  name: 'Client User',
  email: 'client@example.com',
  role: 'client',
  avatar_url: null,
};

describe('ProfessionalOnboardingPageComponent', () => {
  const currentUser = signal<User | null>(client);

  beforeEach(async () => {
    currentUser.set(client);

    await TestBed.configureTestingModule({
      imports: [ProfessionalOnboardingPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: { currentUser },
        },
      ],
    }).compileComponents();
  });

  it('offers the real profile activation route to clients', () => {
    const fixture = TestBed.createComponent(ProfessionalOnboardingPageComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Comenza a ofrecer tus servicios');
    expect(host.textContent).toContain('Datos profesionales');
    expect(host.textContent).toContain('Disponibilidad');
    expect(host.textContent).not.toContain('La API todavia necesita');
    expect(host.querySelector('a[href="/professional/onboarding/profile"]')).toBeTruthy();
    expect(host.querySelector('button[disabled]')).toBeNull();
  });

  it('offers real professional destinations when capability is active', () => {
    currentUser.set({
      ...client,
      professional_profile_status: 'active',
    });
    const fixture = TestBed.createComponent(ProfessionalOnboardingPageComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Tu cuenta ya tiene acceso profesional');
    expect(host.querySelector('a[href="/dashboard/profile"]')).toBeTruthy();
    expect(host.querySelector('button[disabled]')).toBeNull();
  });
});
