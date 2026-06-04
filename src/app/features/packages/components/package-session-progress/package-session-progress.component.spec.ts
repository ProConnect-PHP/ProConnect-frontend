import { TestBed } from '@angular/core/testing';

import { PackageSessionProgressComponent } from './package-session-progress.component';

describe('PackageSessionProgressComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackageSessionProgressComponent],
    }).compileComponents();
  });

  it('shows used and remaining sessions', () => {
    const fixture = TestBed.createComponent(PackageSessionProgressComponent);
    fixture.componentRef.setInput('total', 4);
    fixture.componentRef.setInput('used', 2);
    fixture.componentRef.setInput('remaining', 2);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('2 de 4 sesiones usadas');
    expect(host.textContent).toContain('2 disponibles');
  });
});
