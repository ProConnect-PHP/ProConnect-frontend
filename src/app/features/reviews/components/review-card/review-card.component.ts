import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { Review, ReviewReply } from '../../data-access/reviews.models';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';
import { ReviewReplyFormComponent } from '../review-reply-form/review-reply-form.component';

type ReplyFormMode = 'create' | 'edit';

@Component({
  selector: 'app-review-card',
  imports: [DatePipe, RatingStarsComponent, ReviewReplyFormComponent],
  templateUrl: './review-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewCardComponent {
  readonly review = input.required<Review>();
  readonly compact = input(false);
  readonly canReply = input(false);
  readonly canEditReply = input(false);
  readonly currentProfessionalId = input<string | null>(null);

  readonly replySubmitted = output<ReviewReply>();
  readonly replyUpdated = output<ReviewReply>();

  readonly replyFormMode = signal<ReplyFormMode | null>(null);

  readonly hasVisibleComment = computed(() => {
    const review = this.review();
    return !!review.comment && !review.comment_deleted_at;
  });

  readonly showReplyButton = computed(() => this.canReply() && !this.review().reply);
  readonly showEditReplyButton = computed(() => this.canEditReply() && !!this.review().reply);

  clientName(review: Review): string {
    return review.client?.name ?? 'Cliente de ProConnect';
  }

  clientInitial(review: Review): string {
    return this.clientName(review).trim().slice(0, 1).toUpperCase() || 'C';
  }

  replyProfessionalName(reply: ReviewReply): string {
    return reply.professional?.user.name ?? 'Profesional de ProConnect';
  }

  openReplyForm(mode: ReplyFormMode): void {
    this.replyFormMode.set(mode);
  }

  closeReplyForm(): void {
    this.replyFormMode.set(null);
  }

  onReplyCreated(reply: ReviewReply): void {
    this.replyFormMode.set(null);
    this.replySubmitted.emit(reply);
  }

  onReplyUpdated(reply: ReviewReply): void {
    this.replyFormMode.set(null);
    this.replyUpdated.emit(reply);
  }
}
