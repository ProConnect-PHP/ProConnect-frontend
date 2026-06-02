import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
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
    BookingRescheduleDialogComponent,
    BookingSkeletonComponent,
    BookingTimelineComponent,
  ],
  templateUrl: './booking-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDetailPageComponent implements OnInit {
  private readonly api = inject(BookingsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly booking = signal<Booking | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
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
}
