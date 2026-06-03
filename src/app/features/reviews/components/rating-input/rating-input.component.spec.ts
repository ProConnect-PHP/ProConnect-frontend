import { TestBed } from '@angular/core/testing';

import { RatingInputComponent } from './rating-input.component';

describe('RatingInputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingInputComponent],
    }).compileComponents();
  });

  it('emits values from 1 to 5', () => {
    const fixture = TestBed.createComponent(RatingInputComponent);
    const component = fixture.componentInstance;
    const changes: number[] = [];

    component.registerOnChange((value) => changes.push(value));
    component.selectRating(5);

    expect(changes).toEqual([5]);
    expect(component.value()).toBe(5);
  });
});
