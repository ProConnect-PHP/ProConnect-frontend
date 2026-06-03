import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, map, of, switchMap } from 'rxjs';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { ProfessionalProfileApi } from '../../../professional-profile/data-access/professional-profile.api';
import { ProfessionalProfile } from '../../../professional-profile/models/professional-profile.models';
import { ServicesApi } from '../../../services/data-access/services.api';
import { Service } from '../../../services/models/service.models';
import { mapReviewApiError } from '../../data-access/reviews-error.mapper';
import { ReviewsApi } from '../../data-access/reviews.api';
import { Review, ReviewReply, ReviewsPaginationMeta } from '../../data-access/reviews.models';
import { ReviewCardComponent } from '../../components/review-card/review-card.component';

type ProfessionalReviewGroup = {
  service: Service;
  reviews: Review[];
  meta: ReviewsPaginationMeta | null;
  errorMessage: string | null;
};

@Component({
  selector: 'app-professional-reviews-page',
  imports: [
    RouterLink,
    AppAlertComponent,
    AppEmptyStateComponent,
    AppLoadingSpinnerComponent,
    AppPageHeaderComponent,
    ReviewCardComponent,
  ],
  templateUrl: './professional-reviews-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalReviewsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly profileApi = inject(ProfessionalProfileApi);
  private readonly servicesApi = inject(ServicesApi);
  private readonly reviewsApi = inject(ReviewsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly profile = signal<ProfessionalProfile | null>(null);
  readonly groups = signal<ProfessionalReviewGroup[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly selectedServiceId = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => params.get('serviceId')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((serviceId) => {
        this.selectedServiceId.set(serviceId);
        this.loadReviews();
      });
  }

  canReply(review: Review): boolean {
    return this.profile()?.id === review.professional_id && !review.reply;
  }

  canEditReply(review: Review): boolean {
    return this.profile()?.id === review.professional_id && !!review.reply;
  }

  onReplyCreated(review: Review, reply: ReviewReply): void {
    this.mergeReply(review.id, reply);
    this.successMessage.set('Respuesta publicada correctamente.');
  }

  onReplyUpdated(review: Review, reply: ReviewReply): void {
    this.mergeReply(review.id, reply);
    this.successMessage.set('Respuesta actualizada correctamente.');
  }

  private loadReviews(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.groups.set([]);

    forkJoin({
      profile: this.profileApi.show(),
      services: this.servicesApi.mine(),
    })
      .pipe(
        switchMap(({ profile, services }) => {
          this.profile.set(profile.professional_profile);

          const selectedServiceId = this.selectedServiceId();
          const filteredServices = selectedServiceId
            ? services.services.filter((service) => String(service.id) === selectedServiceId)
            : services.services;

          if (filteredServices.length === 0) {
            return of<ProfessionalReviewGroup[]>([]);
          }

          return forkJoin(
            filteredServices.map((service) =>
              this.reviewsApi.listServiceReviews(service.id, { page: 1, per_page: 25 }).pipe(
                map((response) => ({
                  service,
                  reviews: response.reviews,
                  meta: response.meta,
                  errorMessage: null,
                })),
                catchError((error: unknown) =>
                  of({
                    service,
                    reviews: [],
                    meta: null,
                    errorMessage: mapReviewApiError(error, 'No pudimos cargar estas reseñas.'),
                  }),
                ),
              ),
            ),
          );
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (groups) => this.groups.set(groups),
        error: (error: unknown) => {
          this.errorMessage.set(mapReviewApiError(error, 'No pudimos cargar las reseñas.'));
        },
      });
  }

  private mergeReply(reviewId: string, reply: ReviewReply): void {
    this.groups.update((groups) =>
      groups.map((group) => ({
        ...group,
        reviews: group.reviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                reply,
              }
            : review,
        ),
      })),
    );
  }
}
