import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PackagesApi } from '../../data-access/packages.api';
import { ClientPackage } from '../../data-access/packages.models';
import { BookingPackageSelectorComponent } from './booking-package-selector.component';

const activePackage: ClientPackage = {
  id: 'client-package-1',
  package_product_id: 'package-1',
  client_id: 'client-1',
  professional_id: 'professional-1',
  service_id: 'service-1',
  status: 'active',
  total_sessions: 4,
  used_sessions: 1,
  remaining_sessions: 3,
  price_snapshot: 5600,
  currency: 'UYU',
  purchased_at: null,
  expires_at: null,
  cancelled_at: null,
  depleted_at: null,
  metadata: null,
  package_product: {
    id: 'package-1',
    professional_id: 'professional-1',
    service_id: 'service-1',
    name: 'Pack activo',
    description: null,
    sessions_count: 4,
    price: 5600,
    currency: 'UYU',
    validity_days: null,
    is_active: true,
    created_at: null,
  },
  created_at: null,
};

const depletedPackage: ClientPackage = {
  ...activePackage,
  id: 'client-package-2',
  status: 'depleted',
  remaining_sessions: 0,
  package_product: {
    ...activePackage.package_product!,
    id: 'package-2',
    name: 'Pack agotado',
  },
};

describe('BookingPackageSelectorComponent', () => {
  const api = {
    listMyClientPackages: vi.fn(() =>
      of({
        client_packages: [activePackage, depletedPackage],
        meta: {
          current_page: 1,
          per_page: 10,
          total: 2,
          last_page: 1,
        },
      }),
    ),
  };

  beforeEach(async () => {
    api.listMyClientPackages.mockClear();

    await TestBed.configureTestingModule({
      imports: [BookingPackageSelectorComponent],
      providers: [{ provide: PackagesApi, useValue: api }],
    }).compileComponents();
  });

  it('filters depleted packages', () => {
    const fixture = TestBed.createComponent(BookingPackageSelectorComponent);
    fixture.componentRef.setInput('serviceId', 'service-1');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Pack activo');
    expect(host.textContent).not.toContain('Pack agotado');
  });
});
