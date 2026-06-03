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

import { ReviewReply } from '../../data-access/reviews.models';
import {
  mapReviewApiError,
  reviewFieldErrors,
} from '../../data-access/reviews-error.mapper';
import { ReviewsApi } from '../../data-access/reviews.api';

export type ReviewReplyFormMode = 'create' | 'edit';

@Component({
  selector: 'app-review-reply-form',
  imports: [ReactiveFormsModule],
  templateUrl: './review-reply-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewReplyFormComponent {
  private readonly api = inject(ReviewsApi);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly mode = input<ReviewReplyFormMode>('create');
  readonly initialReply = input<ReviewReply | null>(null);
  readonly reviewId = input<string | undefined>(undefined);
  readonly replyId = input<string | undefined>(undefined);

  readonly replyCreated = output<ReviewReply>();
  readonly replyUpdated = output<ReviewReply>();
  readonly cancelled = output<void>();

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly bodyBackendErrors = signal<string[]>([]);

  readonly form = this.fb.group({
    body: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(3000)]],
  });

  private syncedReplyId: string | null = null;
  private syncedMode: ReviewReplyFormMode | null = null;

  private readonly syncInitialReply = effect(() => {
    const mode = this.mode();
    const reply = this.initialReply();
    const replyId = reply?.id ?? null;

    if (this.syncedReplyId === replyId && this.syncedMode === mode) return;

    this.syncedReplyId = replyId;
    this.syncedMode = mode;
    this.form.reset({
      body: mode === 'edit' ? (reply?.body ?? '') : '',
    });
  });

  title(): string {
    return this.mode() === 'create' ? 'Responder reseña' : 'Editar respuesta';
  }

  submitLabel(): string {
    if (this.submitting()) return 'Guardando...';
    return this.mode() === 'create' ? 'Publicar respuesta' : 'Guardar cambios';
  }

  bodyLength(): number {
    return this.form.controls.body.value.length;
  }

  bodyInvalid(): boolean {
    const control = this.form.controls.body;
    return control.invalid && (control.touched || control.dirty);
  }

  submit(): void {
    this.errorMessage.set(null);
    this.bodyBackendErrors.set([]);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const body = this.form.controls.body.value.trim();

    if (this.mode() === 'create') {
      const reviewId = this.reviewId();
      if (!reviewId) {
        this.submitting.set(false);
        this.errorMessage.set('No encontramos la reseña para responder.');
        return;
      }

      this.api
        .createReviewReply(reviewId, { body })
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: (reply) => this.replyCreated.emit(reply),
          error: (error: unknown) => this.handleError(error),
        });
      return;
    }

    const replyId = this.replyId() ?? this.initialReply()?.id;
    if (!replyId) {
      this.submitting.set(false);
      this.errorMessage.set('No encontramos la respuesta para editar.');
      return;
    }

    this.api
      .updateReviewReply(replyId, { body })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (reply) => this.replyUpdated.emit(reply),
        error: (error: unknown) => this.handleError(error),
      });
  }

  private handleError(error: unknown): void {
    this.bodyBackendErrors.set(reviewFieldErrors(error, 'body'));
    this.errorMessage.set(mapReviewApiError(error, 'No pudimos guardar la respuesta.'));
  }
}
