import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { BookingPackageSummaryComponent } from '../../../packages/components/booking-package-summary/booking-package-summary.component';
import { VideoSessionActionCardComponent } from '../../../video-sessions/components/video-session-action-card/video-session-action-card.component';
import type { VideoSession } from '../../../video-sessions/data-access/video-sessions.models';
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
  selector: 'app-professional-booking-detail-page',
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
    VideoSessionActionCardComponent,
  ],
  templateUrl: './professional-booking-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalBookingDetailPageComponent implements OnInit {
  private readonly api = inject(BookingsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly booking = signal<Booking | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly loadingAction = signal<string | null>(null);
  readonly cancelDialogOpen = signal(false);
  readonly rescheduleDialogOpen = signal(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('bookingId')),
        switchMap((bookingId) => this.fetchBooking(bookingId)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => this.booking.set(response?.booking ?? null));
  }

  confirmBooking(): void {
    const booking = this.booking();
    if (!booking) return;

    this.loadingAction.set('confirm');
    this.errorMessage.set(null);

    this.api
      .confirmBooking(booking.id)
      .pipe(
        finalize(() => this.loadingAction.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.onBookingUpdated(response.booking, 'Reserva confirmada correctamente.'),
        error: (error: unknown) => this.errorMessage.set(bookingErrorMessage(error)),
      });
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

  onVideoSessionEnsured(videoSession: VideoSession): void {
    this.mergeBookingVideoSession(videoSession);
    this.successMessage.set('Sala virtual preparada correctamente.');
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

  private mergeBookingVideoSession(videoSession: VideoSession): void {
    const currentBooking = this.booking();
    if (!currentBooking) return;

    this.booking.set({
      ...currentBooking,
      video_session: videoSession,
    });
  }
}
