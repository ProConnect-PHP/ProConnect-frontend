import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ReviewsApi } from '../../data-access/reviews.api';
import { Review } from '../../data-access/reviews.models';
import { ReviewFormComponent } from './review-form.component';

const review: Review = {
  id: 'review-1',
  booking_id: 'booking-1',
  service_id: 'service-1',
  professional_id: 'professional-1',
  rating: 5,
  comment: null,
  comment_deleted_at: null,
  edited_at: null,
  created_at: null,
};

describe('ReviewFormComponent', () => {
  const api = {
    createBookingReview: vi.fn(() => of(review)),
    updateReview: vi.fn(() => of(review)),
  };

  beforeEach(async () => {
    api.createBookingReview.mockClear();
    api.updateReview.mockClear();

    await TestBed.configureTestingModule({
      imports: [ReviewFormComponent],
      providers: [{ provide: ReviewsApi, useValue: api }],
    }).compileComponents();
  });

  it('is invalid without a rating', () => {
    const fixture = TestBed.createComponent(ReviewFormComponent);
    fixture.componentRef.setInput('bookingId', 'booking-1');
    fixture.detectChanges();

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.form.invalid).toBe(true);
    expect(api.createBookingReview).not.toHaveBeenCalled();
  });

  it('allows a null comment', () => {
    const fixture = TestBed.createComponent(ReviewFormComponent);
    fixture.componentRef.setInput('bookingId', 'booking-1');
    fixture.detectChanges();

    fixture.componentInstance.form.controls.rating.setValue(5);
    fixture.componentInstance.form.controls.comment.setValue('   ');
    fixture.componentInstance.submit();

    expect(api.createBookingReview).toHaveBeenCalledWith('booking-1', {
      rating: 5,
      comment: null,
    });
  });

  it('blocks comments over 3000 characters', () => {
    const fixture = TestBed.createComponent(ReviewFormComponent);
    fixture.componentRef.setInput('bookingId', 'booking-1');
    fixture.detectChanges();

    fixture.componentInstance.form.controls.rating.setValue(5);
    fixture.componentInstance.form.controls.comment.setValue('x'.repeat(3001));

    expect(fixture.componentInstance.form.invalid).toBe(true);
  });
});
