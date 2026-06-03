import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  CreateReviewPayload,
  Review,
  UpdateReviewPayload,
} from '../../data-access/reviews.models';
import {
  mapReviewApiError,
  reviewFieldErrors,
} from '../../data-access/reviews-error.mapper';
import { ReviewsApi } from '../../data-access/reviews.api';
import { RatingInputComponent } from '../rating-input/rating-input.component';

export type ReviewFormMode = 'create' | 'edit';

@Component({
  selector: 'app-review-form',
  imports: [ReactiveFormsModule, RatingInputComponent],
  templateUrl: './review-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewFormComponent {
  private readonly api = inject(ReviewsApi);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly mode = input<ReviewFormMode>('create');
  readonly initialReview = input<Review | null>(null);
  readonly bookingId = input.required<string>();
  readonly disabled = input(false);

  readonly reviewCreated = output<Review>();
  readonly reviewUpdated = output<Review>();
  readonly cancelled = output<void>();

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly ratingBackendErrors = signal<string[]>([]);
  readonly commentBackendErrors = signal<string[]>([]);

  readonly form = this.fb.group({
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.maxLength(3000)]],
  });

  private syncedReviewId: string | null = null;
  private syncedMode: ReviewFormMode | null = null;

  private readonly syncInitialReview = effect(() => {
    const mode = this.mode();
    const review = this.initialReview();
    const reviewId = review?.id ?? null;

    if (this.syncedReviewId === reviewId && this.syncedMode === mode) return;

    this.syncedReviewId = reviewId;
    this.syncedMode = mode;
    this.form.reset({
      rating: mode === 'edit' ? (review?.rating ?? 0) : 0,
      comment: mode === 'edit' ? (review?.comment ?? '') : '',
    });
  });

  private readonly syncDisabledState = effect(() => {
    const shouldDisable = this.disabled() || this.submitting();
    if (shouldDisable && this.form.enabled) {
      this.form.disable({ emitEvent: false });
    } else if (!shouldDisable && this.form.disabled) {
      this.form.enable({ emitEvent: false });
    }
  });

  title(): string {
    return this.mode() === 'create' ? 'Califica tu experiencia' : 'Editar reseña';
  }

  helperText(): string {
    if (this.mode() === 'create') {
      return 'Tu reseña ayuda a otros clientes a elegir mejor.';
    }

    return 'Podes modificar tu reseña dentro de la ventana permitida.';
  }

  submitLabel(): string {
    if (this.submitting()) return 'Guardando...';
    return this.mode() === 'create' ? 'Publicar reseña' : 'Guardar cambios';
  }

  commentLength(): number {
    return this.form.controls.comment.value.length;
  }

  ratingInvalid(): boolean {
    const control = this.form.controls.rating;
    return control.invalid && (control.touched || control.dirty);
  }

  commentInvalid(): boolean {
    const control = this.form.controls.comment;
    return control.invalid && (control.touched || control.dirty);
  }

  submit(): void {
    this.errorMessage.set(null);
    this.ratingBackendErrors.set([]);
    this.commentBackendErrors.set([]);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const comment = this.normalizedComment();
    const rating = this.form.controls.rating.value;
    this.submitting.set(true);

    if (this.mode() === 'create') {
      const payload: CreateReviewPayload = { rating, comment };
      this.api
        .createBookingReview(this.bookingId(), payload)
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: (review) => this.reviewCreated.emit(review),
          error: (error: unknown) => this.handleError(error),
        });
      return;
    }

    const review = this.initialReview();
    if (!review) {
      this.submitting.set(false);
      this.errorMessage.set('No encontramos la reseña para editar.');
      return;
    }

    const payload: UpdateReviewPayload = { rating, comment };
    this.api
      .updateReview(review.id, payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (updatedReview) => this.reviewUpdated.emit(updatedReview),
        error: (error: unknown) => this.handleError(error),
      });
  }

  private normalizedComment(): string | null {
    const value = this.form.controls.comment.value.trim();
    return value.length > 0 ? value : null;
  }

  private handleError(error: unknown): void {
    this.ratingBackendErrors.set(reviewFieldErrors(error, 'rating'));
    this.commentBackendErrors.set(reviewFieldErrors(error, 'comment'));
    this.errorMessage.set(mapReviewApiError(error, 'No pudimos guardar la reseña.'));
  }
}
