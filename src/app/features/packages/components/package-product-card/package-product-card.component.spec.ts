import { TestBed } from '@angular/core/testing';

import { PackageProduct } from '../../data-access/packages.models';
import { PackageProductCardComponent } from './package-product-card.component';

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

describe('PackageProductCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackageProductCardComponent],
    }).compileComponents();
  });

  it('shows price per session', () => {
    const fixture = TestBed.createComponent(PackageProductCardComponent);
    fixture.componentRef.setInput('packageProduct', packageProduct);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('1.400');
    expect(host.textContent).toContain('por sesion');
  });
});
