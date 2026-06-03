import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ReviewsApi } from '../../data-access/reviews.api';
import { ReviewReply } from '../../data-access/reviews.models';
import { ReviewReplyFormComponent } from './review-reply-form.component';

const reply: ReviewReply = {
  id: 'reply-1',
  body: 'Thanks',
  edited_at: null,
  created_at: null,
};

describe('ReviewReplyFormComponent', () => {
  const api = {
    createReviewReply: vi.fn(() => of(reply)),
    updateReviewReply: vi.fn(() => of(reply)),
  };

  beforeEach(async () => {
    api.createReviewReply.mockClear();
    api.updateReviewReply.mockClear();

    await TestBed.configureTestingModule({
      imports: [ReviewReplyFormComponent],
      providers: [{ provide: ReviewsApi, useValue: api }],
    }).compileComponents();
  });

  it('requires a reply body with at least 2 characters', () => {
    const fixture = TestBed.createComponent(ReviewReplyFormComponent);
    fixture.componentRef.setInput('reviewId', 'review-1');
    fixture.detectChanges();

    fixture.componentInstance.form.controls.body.setValue('x');

    expect(fixture.componentInstance.form.invalid).toBe(true);
  });
});
