import { TestBed } from '@angular/core/testing';

import { RatingStarsComponent } from './rating-stars.component';

describe('RatingStarsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingStarsComponent],
    }).compileComponents();
  });

  it('renders an accessible rating label', () => {
    const fixture = TestBed.createComponent(RatingStarsComponent);
    fixture.componentRef.setInput('rating', 4.5);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
      '4.5 de 5 estrellas',
    );
  });
});
