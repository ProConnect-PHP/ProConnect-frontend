import { TestBed } from '@angular/core/testing';

import { PackageProductFormComponent } from './package-product-form.component';

function fillValidForm(component: PackageProductFormComponent): void {
  component.form.setValue({
    service_id: '',
    name: 'Pack de prueba',
    description: '',
    sessions_count: 4,
    price: 1500,
    validity_days: '',
    is_active: true,
  });
}

describe('PackageProductFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackageProductFormComponent],
    }).compileComponents();
  });

  it('disables submit with an invalid sessions count', () => {
    const fixture = TestBed.createComponent(PackageProductFormComponent);
    fixture.detectChanges();

    fillValidForm(fixture.componentInstance);
    fixture.componentInstance.form.controls.sessions_count.setValue('0');
    fixture.detectChanges();

    expect(fixture.componentInstance.form.invalid).toBe(true);
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
  });

  it('disables submit with an invalid price', () => {
    const fixture = TestBed.createComponent(PackageProductFormComponent);
    fixture.detectChanges();

    fillValidForm(fixture.componentInstance);
    fixture.componentInstance.form.controls.price.setValue(0);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.invalid).toBe(true);
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
  });

  it('allows an empty validity period', () => {
    const fixture = TestBed.createComponent(PackageProductFormComponent);
    fixture.detectChanges();

    fillValidForm(fixture.componentInstance);
    fixture.componentInstance.form.controls.validity_days.setValue('');

    expect(fixture.componentInstance.form.valid).toBe(true);
  });

  it('rejects a validity period below one day', () => {
    const fixture = TestBed.createComponent(PackageProductFormComponent);
    fixture.detectChanges();

    fillValidForm(fixture.componentInstance);
    fixture.componentInstance.form.controls.validity_days.setValue(0);

    expect(fixture.componentInstance.form.invalid).toBe(true);
    expect(fixture.componentInstance.form.controls.validity_days.hasError('integerRange')).toBe(true);
  });

  it('emits a normalized payload', () => {
    const fixture = TestBed.createComponent(PackageProductFormComponent);
    fixture.detectChanges();
    const submitted = vi.fn();
    fixture.componentInstance.submitted.subscribe(submitted);

    fillValidForm(fixture.componentInstance);
    fixture.componentInstance.form.patchValue({
      name: '  Pack de prueba  ',
      description: '  Incluye seguimiento  ',
      sessions_count: '4',
      price: '1500',
      validity_days: '60',
    });

    fixture.componentInstance.submit();

    expect(submitted).toHaveBeenCalledWith({
      service_id: null,
      name: 'Pack de prueba',
      description: 'Incluye seguimiento',
      sessions_count: 4,
      price: 1500,
      currency: 'UYU',
      validity_days: 60,
      is_active: true,
    });
  });

  it('shows backend validation errors beside the corresponding field', () => {
    const fixture = TestBed.createComponent(PackageProductFormComponent);
    fixture.componentRef.setInput('fieldErrors', {
      price: 'El precio debe ser mayor o igual a 1.',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#package-price-error').textContent).toContain(
      'El precio debe ser mayor o igual a 1.',
    );
  });

  it('formats the estimated price per session with decimal UYU precision', () => {
    const fixture = TestBed.createComponent(PackageProductFormComponent);
    fixture.detectChanges();

    fixture.componentInstance.form.controls.price.setValue(7);
    fixture.componentInstance.form.controls.sessions_count.setValue(82);

    expect(fixture.componentInstance.pricePreview()).toContain('UYU');
    expect(fixture.componentInstance.pricePreview()).toContain('0,09');
  });
});
