import { TestBed } from '@angular/core/testing';

import { ReviewsApi } from '../../data-access/reviews.api';
import { Review } from '../../data-access/reviews.models';
import { ReviewCardComponent } from './review-card.component';

const deletedCommentReview: Review = {
  id: 'review-1',
  booking_id: 'booking-1',
  service_id: 'service-1',
  professional_id: 'professional-1',
  rating: 4,
  comment: null,
  comment_deleted_at: '2026-06-01T10:00:00Z',
  edited_at: null,
  created_at: null,
  client: {
    id: 'client-1',
    name: 'Client Name',
    avatar_url: null,
  },
  reply: {
    id: 'reply-1',
    body: 'Thanks for sharing your experience.',
    edited_at: null,
    created_at: null,
    professional: {
      id: 'professional-1',
      user: {
        id: 'user-1',
        name: 'Professional Name',
        avatar_url: null,
      },
    },
  },
};

describe('ReviewCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewCardComponent],
      providers: [{ provide: ReviewsApi, useValue: {} }],
    }).compileComponents();
  });

  it('shows deleted comments and professional replies', () => {
    const fixture = TestBed.createComponent(ReviewCardComponent);
    fixture.componentRef.setInput('review', deletedCommentReview);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('El comentario fue eliminado por el cliente.');
    expect(host.textContent).toContain('Respuesta del profesional');
    expect(host.textContent).toContain('Professional Name');
  });
});
