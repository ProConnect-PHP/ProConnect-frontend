import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Review, ReviewReply, ReviewsPaginationMeta } from '../../data-access/reviews.models';
import { ReviewCardComponent } from '../review-card/review-card.component';

@Component({
  selector: 'app-review-list',
  imports: [ReviewCardComponent],
  templateUrl: './review-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewListComponent {
  readonly reviews = input<Review[]>([]);
  readonly meta = input<ReviewsPaginationMeta | null>(null);
  readonly loading = input(false);
  readonly loadingMore = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly canReply = input(false);
  readonly canEditReply = input(false);
  readonly currentProfessionalId = input<string | null>(null);

  readonly loadMore = output<void>();
  readonly retry = output<void>();
  readonly replyCreated = output<{ review: Review; reply: ReviewReply }>();
  readonly replyUpdated = output<{ review: Review; reply: ReviewReply }>();

  readonly skeletonItems = [1, 2, 3] as const;

  readonly hasMore = computed(() => {
    const meta = this.meta();
    return !!meta && meta.current_page < meta.last_page;
  });

  emitReplyCreated(review: Review, reply: ReviewReply): void {
    this.replyCreated.emit({ review, reply });
  }

  emitReplyUpdated(review: Review, reply: ReviewReply): void {
    this.replyUpdated.emit({ review, reply });
  }
}
