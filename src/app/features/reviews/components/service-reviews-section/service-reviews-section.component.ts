import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { mapReviewApiError } from '../../data-access/reviews-error.mapper';
import { ReviewsApi } from '../../data-access/reviews.api';
import { Review, ReviewsPaginationMeta, ServiceId } from '../../data-access/reviews.models';
import { ReviewListComponent } from '../review-list/review-list.component';
import { ReviewSummaryComponent } from '../review-summary/review-summary.component';

@Component({
  selector: 'app-service-reviews-section',
  imports: [ReviewListComponent, ReviewSummaryComponent],
  templateUrl: './service-reviews-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceReviewsSectionComponent {
  private readonly api = inject(ReviewsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly serviceId = input.required<ServiceId>();
  readonly avgRating = input<number | null>(null);
  readonly reviewsCount = input<number | null>(null);

  readonly reviews = signal<Review[]>([]);
  readonly meta = signal<ReviewsPaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly summaryRating = computed(() => {
    const inputRating = this.avgRating();
    if (inputRating !== null) return inputRating;

    const reviews = this.reviews();
    if (reviews.length === 0) return 0;

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  });

  readonly summaryCount = computed(() => this.reviewsCount() ?? this.meta()?.total ?? this.reviews().length);

  private lastServiceId: ServiceId | null = null;

  private readonly loadOnServiceChange = effect(() => {
    const serviceId = this.serviceId();
    if (this.lastServiceId === serviceId) return;

    this.lastServiceId = serviceId;
    this.loadPage(1, false);
  });

  loadMore(): void {
    const meta = this.meta();
    if (!meta || meta.current_page >= meta.last_page) return;
    this.loadPage(meta.current_page + 1, true);
  }

  retry(): void {
    this.loadPage(1, false);
  }

  private loadPage(page: number, append: boolean): void {
    if (append) {
      this.loadingMore.set(true);
    } else {
      this.loading.set(true);
      this.reviews.set([]);
      this.meta.set(null);
    }

    this.errorMessage.set(null);

    this.api
      .listServiceReviews(this.serviceId(), { page, per_page: 10 })
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.loadingMore.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.meta.set(response.meta);
          this.reviews.update((reviews) => (append ? [...reviews, ...response.reviews] : response.reviews));
        },
        error: (error: unknown) => {
          this.errorMessage.set(mapReviewApiError(error, 'Reintenta nuevamente.'));
        },
      });
  }
}
