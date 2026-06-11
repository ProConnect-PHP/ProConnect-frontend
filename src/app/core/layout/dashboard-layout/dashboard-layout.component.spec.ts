import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { User } from '../../auth/models/auth.models';
import { AuthStore } from '../../auth/services/auth.store';
import { DashboardLayoutComponent } from './dashboard-layout.component';

const client: User = {
  id: 'client-1',
  name: 'Client User',
  email: 'client@example.com',
  role: 'client',
  avatar_url: null,
};

describe('DashboardLayoutComponent', () => {
  const currentUser = signal<User | null>(client);
  const loadCurrentUser = vi.fn(() => of(client));
  const logout = vi.fn(() => of(undefined));

  beforeEach(async () => {
    currentUser.set(client);
    loadCurrentUser.mockClear();
    logout.mockClear();

    await TestBed.configureTestingModule({
      imports: [DashboardLayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            currentUser,
            loadCurrentUser,
            logout,
          },
        },
      ],
    }).compileComponents();
  });

  it('shows client navigation and the professional activation CTA to clients', () => {
    const fixture = TestBed.createComponent(DashboardLayoutComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.visibleNavigationGroups().map((group) => group.title)).toEqual(
      ['Cuenta', 'Cliente'],
    );
    expect(fixture.componentInstance.shouldShowProfessionalCta()).toBe(true);

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Mis reservas como cliente');
    expect(host.textContent).toContain('Activar perfil profesional');
    expect(host.textContent).not.toContain('Reservas recibidas');
  });

  it('shows professional navigation when a client account has professional capability', () => {
    currentUser.set({
      ...client,
      has_professional_profile: true,
    });
    const fixture = TestBed.createComponent(DashboardLayoutComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.visibleNavigationGroups().map((group) => group.title)).toEqual(
      ['Cuenta', 'Cliente', 'Profesional'],
    );
    expect(fixture.componentInstance.shouldShowProfessionalCta()).toBe(false);

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Panel profesional');
    expect(host.textContent).toContain('Reservas recibidas');
  });
});
