import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ReviewCardComponent } from '../../../reviews/components/review-card/review-card.component';
import { ReviewFormComponent } from '../../../reviews/components/review-form/review-form.component';
import { ReviewsApi } from '../../../reviews/data-access/reviews.api';
import { mapReviewApiError } from '../../../reviews/data-access/reviews-error.mapper';
import { Review } from '../../../reviews/data-access/reviews.models';
import { BookingPackageSummaryComponent } from '../../../packages/components/booking-package-summary/booking-package-summary.component';
import { PaymentActionCardComponent } from '../../../payments/components/payment-action-card/payment-action-card.component';
import { Payment } from '../../../payments/data-access/payments.models';
import { BookingsApi } from '../../data-access/bookings.api';
import { Booking, BookingResponse } from '../../models/booking.models';
import { bookingErrorMessage } from '../../utils/booking-error-message.util';
import { BookingActionsComponent } from '../../components/booking-actions/booking-actions.component';
import { BookingCancelDialogComponent } from '../../components/booking-cancel-dialog/booking-cancel-dialog.component';
import { BookingDetailCardComponent } from '../../components/booking-detail-card/booking-detail-card.component';
import { BookingRescheduleDialogComponent } from '../../components/booking-reschedule-dialog/booking-reschedule-dialog.component';
import { BookingSkeletonComponent } from '../../components/booking-skeleton/booking-skeleton.component';
import { BookingTimelineComponent } from '../../components/booking-timeline/booking-timeline.component';

@Component({
  selector: 'app-booking-detail-page',
  imports: [
    RouterLink,
    AppAlertComponent,
    AppEmptyStateComponent,
    BookingActionsComponent,
    BookingCancelDialogComponent,
    BookingDetailCardComponent,
    BookingPackageSummaryComponent,
    BookingRescheduleDialogComponent,
    BookingSkeletonComponent,
    BookingTimelineComponent,
    PaymentActionCardComponent,
    ReviewCardComponent,
    ReviewFormComponent,
  ],
  templateUrl: './booking-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDetailPageComponent implements OnInit {
  private readonly api = inject(BookingsApi);
  private readonly reviewsApi = inject(ReviewsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly booking = signal<Booking | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly cancelDialogOpen = signal(false);
  readonly rescheduleDialogOpen = signal(false);
  readonly editingReview = signal(false);
  readonly deletingReviewComment = signal(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('bookingId')),
        switchMap((bookingId) => this.fetchBooking(bookingId)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => this.booking.set(response?.booking ?? null));
  }

  openCancelDialog(): void {
    this.cancelDialogOpen.set(true);
  }

  openRescheduleDialog(): void {
    this.rescheduleDialogOpen.set(true);
  }

  closeDialogs(): void {
    this.cancelDialogOpen.set(false);
    this.rescheduleDialogOpen.set(false);
  }

  onBookingUpdated(booking: Booking, message: string): void {
    const currentBooking = this.booking();
    this.booking.set(currentBooking ? { ...currentBooking, ...booking } : booking);
    this.successMessage.set(message);
  }

  onPaymentCompleted(payment: Payment): void {
    this.mergeBookingPayment(payment);
    this.successMessage.set('Pago confirmado correctamente.');
  }

  reloadBooking(): void {
    const bookingId = this.booking()?.id ?? this.route.snapshot.paramMap.get('bookingId');

    this.fetchBooking(bookingId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if (response?.booking) {
          this.booking.set(response.booking);
        }
      });
  }

  onReviewCreated(review: Review): void {
    this.mergeBookingReview(review);
    this.successMessage.set('Reseña publicada correctamente.');
  }

  onReviewUpdated(review: Review): void {
    this.editingReview.set(false);
    this.mergeBookingReview(review);
    this.successMessage.set('Reseña actualizada correctamente.');
  }

  startReviewEdit(): void {
    this.editingReview.set(true);
  }

  cancelReviewEdit(): void {
    this.editingReview.set(false);
  }

  deleteReviewComment(review: Review): void {
    if (this.deletingReviewComment()) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.deletingReviewComment.set(true);

    this.reviewsApi
      .deleteReviewComment(review.id)
      .pipe(
        finalize(() => this.deletingReviewComment.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updatedReview) => {
          this.mergeBookingReview(updatedReview);
          this.successMessage.set('Comentario eliminado correctamente. La calificacion se mantiene.');
        },
        error: (error: unknown) => {
          this.errorMessage.set(mapReviewApiError(error, 'No pudimos eliminar el comentario.'));
        },
      });
  }

  private fetchBooking(bookingId: string | null) {
    this.loading.set(true);
    this.errorMessage.set(null);

    if (!bookingId) {
      this.loading.set(false);
      this.errorMessage.set('Reserva no encontrada.');
      return of<BookingResponse | null>(null);
    }

    return this.api.showBooking(bookingId).pipe(
      catchError((error: unknown) => {
        this.errorMessage.set(bookingErrorMessage(error));
        return of<BookingResponse | null>(null);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  private mergeBookingReview(review: Review): void {
    const currentBooking = this.booking();
    if (!currentBooking) return;

    this.booking.set({
      ...currentBooking,
      review,
    });
  }

  private mergeBookingPayment(payment: Payment): void {
    const currentBooking = this.booking();
    if (!currentBooking) return;

    const nextStatus: Booking['status'] =
      payment.booking?.status === 'paid' ? 'paid' : currentBooking.status;

    this.booking.set({
      ...currentBooking,
      status: nextStatus,
      paid_at: payment.paid_at ?? currentBooking.paid_at,
      payment,
    });
  }
}
