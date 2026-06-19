import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { User } from '../../../core/auth/models/auth.models';
import { AuthStore } from '../../../core/auth/services/auth.store';
import { ApiClientError } from '../../../core/http/models/api-error.model';
import { ProfessionalProfileApi } from '../data-access/professional-profile.api';
import { ProfessionalProfile } from '../models/professional-profile.models';
import { ProfessionalProfilePageComponent } from './professional-profile-page.component';

const profile: ProfessionalProfile = {
  id: 'profile-1',
  bio: 'Consultora independiente.',
  avg_rating: 0,
  reviews_count: 0,
  is_verified: false,
  created_at: '2026-06-11T12:00:00.000Z',
};

const professional: User = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'professional',
  avatar_url: null,
  has_professional_profile: true,
};

describe('ProfessionalProfilePageComponent', () => {
  const show = vi.fn(() =>
    throwError(() => new ApiClientError('Professional profile not found', 404, 'NotFound')),
  );
  const create = vi.fn(() =>
    of({
      message: 'Professional profile created successfully',
      professional_profile: profile,
      user: professional,
    }),
  );
  const update = vi.fn();
  const setCurrentUser = vi.fn();
  const loadCurrentUser = vi.fn(() => of(professional));

  beforeEach(async () => {
    show.mockClear();
    create.mockClear();
    update.mockClear();
    setCurrentUser.mockClear();
    loadCurrentUser.mockClear();

    await TestBed.configureTestingModule({
      imports: [ProfessionalProfilePageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProfessionalProfileApi,
          useValue: { show, create, update },
        },
        {
          provide: AuthStore,
          useValue: { setCurrentUser, loadCurrentUser },
        },
      ],
    }).compileComponents();
  });

  it('updates the authenticated user and enters the dashboard after activation', () => {
    const fixture = TestBed.createComponent(ProfessionalProfilePageComponent);
    const router = TestBed.inject(Router);
    const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fixture.detectChanges();
    fixture.componentInstance.form.setValue({ bio: 'Consultora independiente.' });
    fixture.componentInstance.save();

    expect(create).toHaveBeenCalledWith({ bio: 'Consultora independiente.' });
    expect(setCurrentUser).toHaveBeenCalledWith(professional);
    expect(loadCurrentUser).not.toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });
});
