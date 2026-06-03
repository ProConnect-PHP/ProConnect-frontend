import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import {
  BookingId,
  CreateReviewPayload,
  CreateReviewReplyPayload,
  PaginatedReviews,
  Review,
  ReviewId,
  ReviewReply,
  ReviewReplyId,
  ServiceId,
  UpdateReviewPayload,
  UpdateReviewReplyPayload,
} from './reviews.models';
import {
  unwrapPaginatedReviewsResponse,
  unwrapReviewReplyResponse,
  unwrapReviewResponse,
} from './reviews.mapper';

@Injectable({ providedIn: 'root' })
export class ReviewsApi {
  private readonly api = inject(ApiClient);

  listServiceReviews(
    serviceId: ServiceId,
    params: { page?: number; per_page?: number } = {},
  ): Observable<PaginatedReviews> {
    return this.api
      .get<unknown>(`services/${serviceId}/reviews`, { params })
      .pipe(map((response) => unwrapPaginatedReviewsResponse(response)));
  }

  createBookingReview(bookingId: BookingId, payload: CreateReviewPayload): Observable<Review> {
    return this.api
      .post<unknown, CreateReviewPayload>(`bookings/${bookingId}/review`, payload)
      .pipe(map((response) => unwrapReviewResponse(response)));
  }

  updateReview(reviewId: ReviewId, payload: UpdateReviewPayload): Observable<Review> {
    return this.api
      .put<unknown, UpdateReviewPayload>(`reviews/${reviewId}`, payload)
      .pipe(map((response) => unwrapReviewResponse(response)));
  }

  deleteReviewComment(reviewId: ReviewId): Observable<Review> {
    return this.api
      .delete<unknown>(`reviews/${reviewId}`)
      .pipe(map((response) => unwrapReviewResponse(response)));
  }

  createReviewReply(reviewId: ReviewId, payload: CreateReviewReplyPayload): Observable<ReviewReply> {
    return this.api
      .post<unknown, CreateReviewReplyPayload>(`reviews/${reviewId}/replies`, payload)
      .pipe(map((response) => unwrapReviewReplyResponse(response)));
  }

  updateReviewReply(
    replyId: ReviewReplyId,
    payload: UpdateReviewReplyPayload,
  ): Observable<ReviewReply> {
    return this.api
      .put<unknown, UpdateReviewReplyPayload>(`review-replies/${replyId}`, payload)
      .pipe(map((response) => unwrapReviewReplyResponse(response)));
  }
}
