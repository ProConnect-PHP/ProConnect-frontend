import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthStore } from '../../../../core/auth/services/auth.store';
import { PackagesApi } from '../../data-access/packages.api';
import { PackageProduct } from '../../data-access/packages.models';
import { ServicePackagesSectionComponent } from './service-packages-section.component';

const packageProduct: PackageProduct = {
  id: 'package-1',
  professional_id: 'professional-1',
  service_id: 'service-1',
  name: 'Pack 4 sesiones',
  description: null,
  sessions_count: 4,
  price: 5600,
  currency: 'UYU',
  validity_days: 60,
  is_active: true,
  created_at: null,
};

describe('ServicePackagesSectionComponent', () => {
  const packagesApi = {
    listServicePackageProducts: vi.fn(() => of([])),
  };
  const authStore = {
    isAuthenticated: vi.fn(() => true),
    currentUser: vi.fn(() => ({ id: 'user-1', role: 'professional' })),
  };
  const router = {
    url: '/services/service-1',
    navigate: vi.fn(),
  };

  beforeEach(async () => {
    packagesApi.listServicePackageProducts.mockClear();
    authStore.isAuthenticated.mockClear();
    router.navigate.mockClear();

    await TestBed.configureTestingModule({
      imports: [ServicePackagesSectionComponent],
      providers: [
        { provide: PackagesApi, useValue: packagesApi },
        { provide: AuthStore, useValue: authStore },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });

  it('allows an authenticated professional account to buy as a client', () => {
    const fixture = TestBed.createComponent(ServicePackagesSectionComponent);
    fixture.componentRef.setInput('serviceId', 'service-1');
    fixture.detectChanges();

    fixture.componentInstance.startPurchase(packageProduct);

    expect(authStore.isAuthenticated).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(fixture.componentInstance.selectedPackageProduct()).toEqual(packageProduct);
  });
});
