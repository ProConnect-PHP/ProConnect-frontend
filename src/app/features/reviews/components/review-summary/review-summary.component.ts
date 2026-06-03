import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { RatingStarsComponent } from '../rating-stars/rating-stars.component';

@Component({
  selector: 'app-review-summary',
  imports: [RatingStarsComponent],
  templateUrl: './review-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewSummaryComponent {
  readonly rating = input(0);
  readonly reviewsCount = input(0);

  readonly countLabel = computed(() => {
    const count = this.reviewsCount();
    if (count === 0) return 'Sin reseñas todavia';
    if (count === 1) return '1 reseña verificada';
    return `${count} reseñas verificadas`;
  });
}
