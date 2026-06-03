import {
  unwrapPaginatedReviewsResponse,
  unwrapReviewReplyResponse,
  unwrapReviewResponse,
} from './reviews.mapper';

describe('reviews mapper', () => {
  it('unwraps direct review responses', () => {
    const review = unwrapReviewResponse({
      review: {
        id: 'review-1',
        booking_id: 'booking-1',
        service_id: 10,
        professional_id: 'professional-1',
        rating: 5,
        comment: 'Great service',
        comment_deleted_at: null,
        edited_at: null,
        created_at: '2026-06-01T10:00:00Z',
      },
    });

    expect(review.id).toBe('review-1');
    expect(review.rating).toBe(5);
    expect(review.comment).toBe('Great service');
  });

  it('unwraps ApiResponse paginated reviews', () => {
    const response = unwrapPaginatedReviewsResponse({
      success: true,
      data: {
        reviews: [
          {
            id: 'review-1',
            booking_id: 'booking-1',
            service_id: 'service-1',
            professional_id: 'professional-1',
            rating: '4',
            comment: null,
            comment_deleted_at: '2026-06-01T10:00:00Z',
            edited_at: null,
            created_at: null,
          },
        ],
        meta: {
          current_page: 1,
          per_page: 10,
          total: 1,
          last_page: 1,
        },
      },
    });

    expect(response.reviews).toHaveLength(1);
    expect(response.reviews[0].rating).toBe(4);
    expect(response.meta.total).toBe(1);
  });

  it('unwraps reply responses', () => {
    const reply = unwrapReviewReplyResponse({
      data: {
        reply: {
          id: 'reply-1',
          body: 'Thanks for your review',
          edited_at: null,
          created_at: null,
        },
      },
      success: true,
    });

    expect(reply.id).toBe('reply-1');
    expect(reply.body).toBe('Thanks for your review');
  });
});
