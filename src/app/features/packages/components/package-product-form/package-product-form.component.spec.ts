import { TestBed } from '@angular/core/testing';

import { PackageProductFormComponent } from './package-product-form.component';

describe('PackageProductFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackageProductFormComponent],
    }).compileComponents();
  });

  it('is invalid with zero sessions', () => {
    const fixture = TestBed.createComponent(PackageProductFormComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.controls.sessions_count.setValue('0');
    fixture.componentInstance.form.controls.name.setValue('Pack');
    fixture.componentInstance.form.controls.price.setValue('1000');
    fixture.detectChanges();

    expect(fixture.componentInstance.form.invalid).toBe(true);
  });
});
